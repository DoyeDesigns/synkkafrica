"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { isAppLocale } from "@/i18n/config";
import { isCurrencyCode } from "@/lib/preferences/currencies";
import {
  preferencesFromCookies,
  readPreferenceCookie,
} from "@/lib/preferences/location-preferences";
import {
  CURRENCY_COOKIE,
  LANGUAGE_COOKIE,
  PREFERENCES_STORAGE_KEY,
  USER_PREFERENCES_COOKIE,
  type CurrencyCode,
  type LanguageCode,
  type PreferencesState,
} from "@/lib/preferences/types";

function writePreferenceCookie(name: string, value: string) {
  if (typeof document === "undefined") return;

  document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=31536000;SameSite=Lax`;
}

function markManualPreferences() {
  writePreferenceCookie(USER_PREFERENCES_COOKIE, "manual");
}

function sanitizeLanguage(value: string | undefined): LanguageCode {
  return isAppLocale(value) ? value : "en";
}

function sanitizeCurrency(value: string | undefined): CurrencyCode {
  return isCurrencyCode(value) ? value : "USD";
}

function getInitialPreferences(): Pick<
  PreferencesState,
  "language" | "currency" | "hasUserSetPreferences"
> {
  const fromCookies = preferencesFromCookies();
  const hasUserSetPreferences =
    readPreferenceCookie(USER_PREFERENCES_COOKIE) === "manual";

  return {
    language: sanitizeLanguage(fromCookies?.language),
    currency: sanitizeCurrency(fromCookies?.currency),
    hasUserSetPreferences,
  };
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      ...getInitialPreferences(),
      setLanguage: (language) => {
        markManualPreferences();
        writePreferenceCookie(LANGUAGE_COOKIE, language);
        set({ language, hasUserSetPreferences: true });
      },
      setCurrency: (currency) => {
        markManualPreferences();
        writePreferenceCookie(CURRENCY_COOKIE, currency);
        set({ currency, hasUserSetPreferences: true });
      },
      applyLocationPreferences: (preferences) => {
        if (get().hasUserSetPreferences) {
          return;
        }

        writePreferenceCookie(LANGUAGE_COOKIE, preferences.language);
        writePreferenceCookie(CURRENCY_COOKIE, preferences.currency);
        set({
          language: preferences.language,
          currency: preferences.currency,
        });
      },
    }),
    {
      name: PREFERENCES_STORAGE_KEY,
      partialize: (state) => ({
        language: state.language,
        currency: state.currency,
        hasUserSetPreferences: state.hasUserSetPreferences,
      }),
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<PreferencesState>;

        // Cookies are the source of truth for manual picks (survives hydration races).
        if (typeof document !== "undefined") {
          const manual =
            readPreferenceCookie(USER_PREFERENCES_COOKIE) === "manual";
          const cookieLanguage = readPreferenceCookie(LANGUAGE_COOKIE);
          const cookieCurrency = readPreferenceCookie(CURRENCY_COOKIE);

          if (
            manual &&
            isAppLocale(cookieLanguage) &&
            isCurrencyCode(cookieCurrency)
          ) {
            return {
              ...current,
              language: cookieLanguage,
              currency: cookieCurrency,
              hasUserSetPreferences: true,
            };
          }
        }

        const languageValid = isAppLocale(saved.language);
        const currencyValid = isCurrencyCode(saved.currency);
        const hasUserSetPreferences =
          Boolean(saved.hasUserSetPreferences) && languageValid && currencyValid;

        return {
          ...current,
          ...saved,
          language: sanitizeLanguage(saved.language),
          currency: sanitizeCurrency(saved.currency),
          hasUserSetPreferences,
        };
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        if (typeof document !== "undefined") {
          const manual =
            readPreferenceCookie(USER_PREFERENCES_COOKIE) === "manual";
          const cookieLanguage = readPreferenceCookie(LANGUAGE_COOKIE);
          const cookieCurrency = readPreferenceCookie(CURRENCY_COOKIE);

          if (
            manual &&
            isAppLocale(cookieLanguage) &&
            isCurrencyCode(cookieCurrency)
          ) {
            state.language = cookieLanguage;
            state.currency = cookieCurrency;
            state.hasUserSetPreferences = true;
            return;
          }
        }

        const languageValid = isAppLocale(state.language);
        const currencyValid = isCurrencyCode(state.currency);
        state.language = sanitizeLanguage(state.language);
        state.currency = sanitizeCurrency(state.currency);

        if (!languageValid || !currencyValid) {
          state.hasUserSetPreferences = false;
        }

        writePreferenceCookie(LANGUAGE_COOKIE, state.language);
        writePreferenceCookie(CURRENCY_COOKIE, state.currency);

        if (state.hasUserSetPreferences) {
          markManualPreferences();
        } else if (typeof document !== "undefined") {
          document.cookie = `${USER_PREFERENCES_COOKIE}=;path=/;max-age=0;SameSite=Lax`;
        }
      },
    },
  ),
);
