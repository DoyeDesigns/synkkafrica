"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  CURRENCY_COOKIE,
  LANGUAGE_COOKIE,
  PREFERENCES_STORAGE_KEY,
  type CurrencyCode,
  type LanguageCode,
  type PreferencesState,
} from "@/lib/preferences/types";

function writePreferenceCookie(name: string, value: string) {
  if (typeof document === "undefined") return;

  document.cookie = `${name}=${value};path=/;max-age=31536000;SameSite=Lax`;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      language: "en",
      currency: "NGN",
      setLanguage: (language) => {
        writePreferenceCookie(LANGUAGE_COOKIE, language);
        set({ language });
      },
      setCurrency: (currency) => {
        writePreferenceCookie(CURRENCY_COOKIE, currency);
        set({ currency });
      },
    }),
    {
      name: PREFERENCES_STORAGE_KEY,
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        writePreferenceCookie(LANGUAGE_COOKIE, state.language);
        writePreferenceCookie(CURRENCY_COOKIE, state.currency);
      },
    },
  ),
);
