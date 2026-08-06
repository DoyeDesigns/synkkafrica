export type LanguageCode = "en" | "fr" | "es" | "de";

export type CurrencyCode = "NGN" | "USD" | "GBP" | "KES" | "GHS" | "AED" | "GMD";

export type PreferencesState = {
  language: LanguageCode;
  currency: CurrencyCode;
  hasUserSetPreferences: boolean;
  setLanguage: (language: LanguageCode) => void;
  setCurrency: (currency: CurrencyCode) => void;
  applyLocationPreferences: (preferences: {
    language: LanguageCode;
    currency: CurrencyCode;
  }) => void;
};

export const PREFERENCES_STORAGE_KEY = "synkafrica-preferences";

export const CURRENCY_COOKIE = "synkafrica-currency";
export const LANGUAGE_COOKIE = "synkafrica-language";
export const USER_PREFERENCES_COOKIE = "synkafrica-user-preferences";
