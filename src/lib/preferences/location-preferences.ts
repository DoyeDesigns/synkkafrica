import type { CurrencyCode, LanguageCode } from "@/lib/preferences/types";
import {
  CURRENCY_COOKIE,
  LANGUAGE_COOKIE,
  USER_PREFERENCES_COOKIE,
} from "@/lib/preferences/types";

export type DetectedPreferences = {
  language: LanguageCode;
  currency: CurrencyCode;
};

const LANGUAGE_CODES = new Set<LanguageCode>(["en", "fr", "es", "de"]);
const CURRENCY_CODES = new Set<CurrencyCode>([
  "NGN",
  "USD",
  "GBP",
  "KES",
  "GHS",
  "AED",
  "GMD",
]);

const COUNTRY_TO_CURRENCY: Record<string, CurrencyCode> = {
  NG: "NGN",
  US: "USD",
  GB: "GBP",
  KE: "KES",
  GH: "GHS",
  AE: "AED",
  GM: "GMD",
};

const FRENCH_SPEAKING_COUNTRIES = new Set([
  "FR",
  "BE",
  "CH",
  "CA",
  "SN",
  "CI",
  "ML",
  "BF",
  "NE",
  "TG",
  "BJ",
  "CM",
  "CD",
  "CF",
  "CG",
  "GA",
  "GN",
  "MG",
  "MR",
  "DJ",
  "KM",
  "HT",
  "LU",
  "MC",
  "RW",
]);

const SPANISH_SPEAKING_COUNTRIES = new Set([
  "ES",
  "MX",
  "AR",
  "CO",
  "CL",
  "PE",
  "VE",
  "EC",
  "GT",
  "CU",
  "BO",
  "DO",
  "HN",
  "PY",
  "SV",
  "NI",
  "CR",
  "PA",
  "UY",
  "GQ",
]);

const GERMAN_SPEAKING_COUNTRIES = new Set(["DE", "AT", "LI"]);

const DEFAULT_PREFERENCES: DetectedPreferences = {
  language: "en",
  currency: "NGN",
};

function isLanguageCode(value: string | undefined | null): value is LanguageCode {
  return Boolean(value && LANGUAGE_CODES.has(value as LanguageCode));
}

function isCurrencyCode(value: string | undefined | null): value is CurrencyCode {
  return Boolean(value && CURRENCY_CODES.has(value as CurrencyCode));
}

function parseLanguageTag(tag: string | undefined | null): LanguageCode | null {
  if (!tag) {
    return null;
  }

  const normalized = tag.trim().split(",")[0]?.split(";")[0]?.trim().toLowerCase();

  if (!normalized) {
    return null;
  }

  const language = normalized.split("-")[0];

  return isLanguageCode(language) ? language : null;
}

function parseRegionCode(tag: string | undefined | null): string | null {
  if (!tag) {
    return null;
  }

  const normalized = tag.trim().split(",")[0]?.split(";")[0]?.trim();

  if (!normalized) {
    return null;
  }

  const parts = normalized.split("-");

  return parts[1]?.toUpperCase() ?? null;
}

function detectLanguageFromCountry(countryCode: string | null | undefined): LanguageCode | null {
  if (!countryCode) {
    return null;
  }

  const country = countryCode.toUpperCase();

  if (FRENCH_SPEAKING_COUNTRIES.has(country)) {
    return "fr";
  }

  if (SPANISH_SPEAKING_COUNTRIES.has(country)) {
    return "es";
  }

  if (GERMAN_SPEAKING_COUNTRIES.has(country)) {
    return "de";
  }

  return "en";
}

function detectCurrencyFromCountry(countryCode: string | null | undefined): CurrencyCode {
  if (!countryCode) {
    return DEFAULT_PREFERENCES.currency;
  }

  return COUNTRY_TO_CURRENCY[countryCode.toUpperCase()] ?? DEFAULT_PREFERENCES.currency;
}

export function detectPreferencesFromRequest(input: {
  countryCode?: string | null;
  acceptLanguage?: string | null;
  browserLocale?: string | null;
}): DetectedPreferences {
  const regionFromBrowser = parseRegionCode(input.browserLocale);
  const countryCode = input.countryCode ?? regionFromBrowser;

  const languageFromHeader = parseLanguageTag(input.acceptLanguage);
  const languageFromBrowser = parseLanguageTag(input.browserLocale);
  const languageFromCountry = detectLanguageFromCountry(countryCode);

  const language =
    languageFromHeader ?? languageFromBrowser ?? languageFromCountry ?? DEFAULT_PREFERENCES.language;

  const currency = detectCurrencyFromCountry(countryCode);

  return { language, currency };
}

export function detectClientPreferences(): DetectedPreferences {
  if (typeof navigator === "undefined") {
    return DEFAULT_PREFERENCES;
  }

  return detectPreferencesFromRequest({
    browserLocale: navigator.language,
  });
}

export function readPreferenceCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));

  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export function preferencesFromCookies(): DetectedPreferences | null {
  const language = readPreferenceCookie(LANGUAGE_COOKIE);
  const currency = readPreferenceCookie(CURRENCY_COOKIE);

  if (!isLanguageCode(language) || !isCurrencyCode(currency)) {
    return null;
  }

  return { language, currency };
}

export function hasManualPreferencesCookie(): boolean {
  return readPreferenceCookie(USER_PREFERENCES_COOKIE) === "manual";
}
