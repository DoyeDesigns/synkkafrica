import { cookies, headers } from "next/headers";

import {
  detectPreferencesFromRequest,
  type DetectedPreferences,
} from "@/lib/preferences/location-preferences";
import {
  CURRENCY_COOKIE,
  LANGUAGE_COOKIE,
  USER_PREFERENCES_COOKIE,
  type CurrencyCode,
  type LanguageCode,
} from "@/lib/preferences/types";

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

function isLanguageCode(value: string | undefined): value is LanguageCode {
  return Boolean(value && LANGUAGE_CODES.has(value as LanguageCode));
}

function isCurrencyCode(value: string | undefined): value is CurrencyCode {
  return Boolean(value && CURRENCY_CODES.has(value as CurrencyCode));
}

export async function resolveLocationPreferences(): Promise<DetectedPreferences | null> {
  const cookieStore = await cookies();
  const headerStore = await headers();

  if (cookieStore.get(USER_PREFERENCES_COOKIE)?.value === "manual") {
    return null;
  }

  const existingLanguage = cookieStore.get(LANGUAGE_COOKIE)?.value;
  const existingCurrency = cookieStore.get(CURRENCY_COOKIE)?.value;

  if (isLanguageCode(existingLanguage) && isCurrencyCode(existingCurrency)) {
    return {
      language: existingLanguage,
      currency: existingCurrency,
    };
  }

  const detected = detectPreferencesFromRequest({
    countryCode:
      headerStore.get("x-vercel-ip-country") ??
      headerStore.get("cf-ipcountry") ??
      headerStore.get("x-country-code"),
    acceptLanguage: headerStore.get("accept-language"),
  });

  return detected;
}
