import { locales, type AppLocale } from "@/i18n/config";
import { isCurrencyCode } from "@/lib/preferences/currencies";
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

const LANGUAGE_CODES = new Set<string>(locales);

/** Major country → currency. Unknown countries default to USD (not NGN). */
const COUNTRY_TO_CURRENCY: Record<string, CurrencyCode> = {
  NG: "NGN",
  US: "USD",
  GB: "GBP",
  UK: "GBP",
  IE: "EUR",
  FR: "EUR",
  DE: "EUR",
  ES: "EUR",
  IT: "EUR",
  PT: "EUR",
  NL: "EUR",
  BE: "EUR",
  AT: "EUR",
  FI: "EUR",
  GR: "EUR",
  LU: "EUR",
  MT: "EUR",
  CY: "EUR",
  SK: "EUR",
  SI: "EUR",
  EE: "EUR",
  LV: "EUR",
  LT: "EUR",
  HR: "EUR",
  CA: "CAD",
  AU: "AUD",
  NZ: "NZD",
  ZA: "ZAR",
  KE: "KES",
  GH: "GHS",
  AE: "AED",
  GM: "GMD",
  EG: "EGP",
  MA: "MAD",
  TZ: "TZS",
  UG: "UGX",
  SN: "XOF",
  CI: "XOF",
  BJ: "XOF",
  BF: "XOF",
  ML: "XOF",
  NE: "XOF",
  TG: "XOF",
  GW: "XOF",
  CM: "XAF",
  CF: "XAF",
  TD: "XAF",
  CG: "XAF",
  GA: "XAF",
  GQ: "XAF",
  IN: "INR",
  CN: "CNY",
  JP: "JPY",
  CH: "CHF",
  SE: "SEK",
  NO: "NOK",
  DK: "DKK",
  SG: "SGD",
  HK: "HKD",
  BR: "BRL",
  MX: "MXN",
  SA: "AED",
  RW: "USD",
  ET: "USD",
  KR: "KRW",
  TR: "TRY",
  RU: "RUB",
  ID: "IDR",
  TH: "THB",
  VN: "VND",
  PL: "PLN",
  TW: "USD",
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
const PORTUGUESE_SPEAKING_COUNTRIES = new Set(["PT", "BR", "AO", "MZ", "CV", "GW", "ST"]);
const ARABIC_SPEAKING_COUNTRIES = new Set([
  "SA",
  "AE",
  "EG",
  "MA",
  "DZ",
  "TN",
  "IQ",
  "JO",
  "LB",
  "KW",
  "QA",
  "BH",
  "OM",
  "YE",
  "SD",
  "LY",
]);
const ITALIAN_SPEAKING_COUNTRIES = new Set(["IT", "SM", "VA"]);
const DUTCH_SPEAKING_COUNTRIES = new Set(["NL"]);
const CHINESE_SPEAKING_COUNTRIES = new Set(["CN", "TW", "HK"]);
const JAPANESE_SPEAKING_COUNTRIES = new Set(["JP"]);
const HINDI_SPEAKING_COUNTRIES = new Set(["IN"]);
const KOREAN_SPEAKING_COUNTRIES = new Set(["KR"]);
const RUSSIAN_SPEAKING_COUNTRIES = new Set(["RU", "BY", "KZ"]);
const TURKISH_SPEAKING_COUNTRIES = new Set(["TR"]);
const INDONESIAN_SPEAKING_COUNTRIES = new Set(["ID"]);
const SWEDISH_SPEAKING_COUNTRIES = new Set(["SE"]);
const POLISH_SPEAKING_COUNTRIES = new Set(["PL"]);
const THAI_SPEAKING_COUNTRIES = new Set(["TH"]);
const VIETNAMESE_SPEAKING_COUNTRIES = new Set(["VN"]);
const DANISH_SPEAKING_COUNTRIES = new Set(["DK"]);
const NORWEGIAN_SPEAKING_COUNTRIES = new Set(["NO"]);

const DEFAULT_PREFERENCES: DetectedPreferences = {
  language: "en",
  currency: "USD",
};

function isLanguageCode(value: string | undefined | null): value is LanguageCode {
  return Boolean(value && LANGUAGE_CODES.has(value));
}

function parseLanguageTag(tag: string | undefined | null): LanguageCode | null {
  if (!tag) return null;
  const normalized = tag.trim().split(",")[0]?.split(";")[0]?.trim().toLowerCase();
  if (!normalized) return null;
  const language = normalized.split("-")[0];
  // Norwegian Bokmål tags often arrive as nb / nn — map to our `no` locale.
  if (language === "nb" || language === "nn") {
    return isLanguageCode("no") ? "no" : null;
  }
  return isLanguageCode(language) ? (language as AppLocaleWiden) : null;
}

type AppLocaleWiden = LanguageCode;

function parseRegionCode(tag: string | undefined | null): string | null {
  if (!tag) return null;
  const normalized = tag.trim().split(",")[0]?.split(";")[0]?.trim();
  if (!normalized) return null;
  const parts = normalized.split("-");
  return parts[1]?.toUpperCase() ?? null;
}

function detectLanguageFromCountry(
  countryCode: string | null | undefined,
): LanguageCode | null {
  if (!countryCode) return null;
  const country = countryCode.toUpperCase();
  if (FRENCH_SPEAKING_COUNTRIES.has(country)) return "fr";
  if (SPANISH_SPEAKING_COUNTRIES.has(country)) return "es";
  if (GERMAN_SPEAKING_COUNTRIES.has(country)) return "de";
  if (PORTUGUESE_SPEAKING_COUNTRIES.has(country)) return "pt";
  if (ARABIC_SPEAKING_COUNTRIES.has(country)) return "ar";
  if (ITALIAN_SPEAKING_COUNTRIES.has(country)) return "it";
  if (DUTCH_SPEAKING_COUNTRIES.has(country)) return "nl";
  if (CHINESE_SPEAKING_COUNTRIES.has(country)) return "zh";
  if (JAPANESE_SPEAKING_COUNTRIES.has(country)) return "ja";
  if (HINDI_SPEAKING_COUNTRIES.has(country)) return "hi";
  if (KOREAN_SPEAKING_COUNTRIES.has(country)) return "ko";
  if (RUSSIAN_SPEAKING_COUNTRIES.has(country)) return "ru";
  if (TURKISH_SPEAKING_COUNTRIES.has(country)) return "tr";
  if (INDONESIAN_SPEAKING_COUNTRIES.has(country)) return "id";
  if (SWEDISH_SPEAKING_COUNTRIES.has(country)) return "sv";
  if (POLISH_SPEAKING_COUNTRIES.has(country)) return "pl";
  if (THAI_SPEAKING_COUNTRIES.has(country)) return "th";
  if (VIETNAMESE_SPEAKING_COUNTRIES.has(country)) return "vi";
  if (DANISH_SPEAKING_COUNTRIES.has(country)) return "da";
  if (NORWEGIAN_SPEAKING_COUNTRIES.has(country)) return "no";
  return "en";
}

function detectCurrencyFromCountry(
  countryCode: string | null | undefined,
): CurrencyCode {
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
  // Prefer IP/geo country; fall back to browser region (e.g. en-US → US).
  const regionFromBrowser = parseRegionCode(input.browserLocale);
  const countryCode = input.countryCode ?? regionFromBrowser;

  // Location drives language + currency. Browser Accept-Language is only a
  // fallback when country cannot be resolved.
  const languageFromCountry = detectLanguageFromCountry(countryCode);
  const languageFromHeader = parseLanguageTag(input.acceptLanguage);
  const languageFromBrowser = parseLanguageTag(input.browserLocale);

  const language =
    languageFromCountry ??
    languageFromHeader ??
    languageFromBrowser ??
    DEFAULT_PREFERENCES.language;

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
