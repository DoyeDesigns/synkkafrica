import { cookies, headers } from "next/headers";

import { isCurrencyCode } from "@/lib/preferences/currencies";
import {
  detectPreferencesFromRequest,
  type DetectedPreferences,
} from "@/lib/preferences/location-preferences";
import { locales, type AppLocale } from "@/i18n/config";
import {
  CURRENCY_COOKIE,
  LANGUAGE_COOKIE,
  USER_PREFERENCES_COOKIE,
  type CurrencyCode,
  type LanguageCode,
} from "@/lib/preferences/types";

const LANGUAGE_CODES = new Set<string>(locales);

function isLanguageCode(value: string | undefined): value is LanguageCode {
  return Boolean(value && LANGUAGE_CODES.has(value));
}

export async function resolveLocationPreferences(): Promise<DetectedPreferences | null> {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const countryCode =
    headerStore.get("x-vercel-ip-country") ??
    headerStore.get("cf-ipcountry") ??
    headerStore.get("x-country-code");

  // Manual override always wins.
  if (cookieStore.get(USER_PREFERENCES_COOKIE)?.value === "manual") {
    const language = cookieStore.get(LANGUAGE_COOKIE)?.value;
    const currency = cookieStore.get(CURRENCY_COOKIE)?.value;
    if (isLanguageCode(language) && isCurrencyCode(currency)) {
      return {
        language,
        currency: currency as CurrencyCode,
      };
    }
  }

  // Geo / Accept-Language determine defaults when the user has not chosen manually.
  return detectPreferencesFromRequest({
    countryCode,
    acceptLanguage: headerStore.get("accept-language"),
  });
}

export type { AppLocale };
