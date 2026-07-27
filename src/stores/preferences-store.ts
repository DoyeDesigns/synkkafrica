"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

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

function getInitialPreferences(): Pick<
  PreferencesState,
  "language" | "currency" | "hasUserSetPreferences"
> {
  const fromCookies = preferencesFromCookies();
  const hasUserSetPreferences =
    readPreferenceCookie(USER_PREFERENCES_COOKIE) === "manual";

  return {
    language: fromCookies?.language ?? "en",
    currency: fromCookies?.currency ?? "NGN",
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
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        writePreferenceCookie(LANGUAGE_COOKIE, state.language);
        writePreferenceCookie(CURRENCY_COOKIE, state.currency);

        if (state.hasUserSetPreferences) {
          markManualPreferences();
        }
      },
    },
  ),
);
