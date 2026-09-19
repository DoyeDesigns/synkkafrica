import type { AppLocale } from "@/i18n/config";

export type LanguageCode = AppLocale;

export type CurrencyCode =
  | "NGN"
  | "USD"
  | "EUR"
  | "GBP"
  | "CAD"
  | "AUD"
  | "ZAR"
  | "KES"
  | "GHS"
  | "AED"
  | "GMD"
  | "EGP"
  | "MAD"
  | "TZS"
  | "UGX"
  | "XOF"
  | "XAF"
  | "INR"
  | "CNY"
  | "JPY"
  | "CHF"
  | "SEK"
  | "NOK"
  | "DKK"
  | "NZD"
  | "SGD"
  | "HKD"
  | "BRL"
  | "MXN"
  | "KRW"
  | "TRY"
  | "RUB"
  | "IDR"
  | "THB"
  | "VND"
  | "PLN";

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
