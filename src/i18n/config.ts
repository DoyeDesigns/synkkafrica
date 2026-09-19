export const LANGUAGE_COOKIE = "synkafrica-language";

/** Locales shipped with message catalogs (en is the editable source of truth). */
export const locales = [
  "en",
  "fr",
  "es",
  "de",
  "pt",
  "ar",
  "zh",
  "ja",
  "hi",
  "it",
  "nl",
  "ko",
  "ru",
  "tr",
  "id",
  "sv",
  "pl",
  "th",
  "vi",
  "da",
  "no",
] as const;

export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "en";

export const localeLabels: Record<
  AppLocale,
  { label: string; flag: string; htmlLang: string }
> = {
  en: { label: "English", flag: "🇬🇧", htmlLang: "en" },
  fr: { label: "Français", flag: "🇫🇷", htmlLang: "fr" },
  es: { label: "Español", flag: "🇪🇸", htmlLang: "es" },
  de: { label: "Deutsch", flag: "🇩🇪", htmlLang: "de" },
  pt: { label: "Português", flag: "🇵🇹", htmlLang: "pt" },
  ar: { label: "العربية", flag: "🇸🇦", htmlLang: "ar" },
  zh: { label: "中文", flag: "🇨🇳", htmlLang: "zh" },
  ja: { label: "日本語", flag: "🇯🇵", htmlLang: "ja" },
  hi: { label: "हिन्दी", flag: "🇮🇳", htmlLang: "hi" },
  it: { label: "Italiano", flag: "🇮🇹", htmlLang: "it" },
  nl: { label: "Nederlands", flag: "🇳🇱", htmlLang: "nl" },
  ko: { label: "한국어", flag: "🇰🇷", htmlLang: "ko" },
  ru: { label: "Русский", flag: "🇷🇺", htmlLang: "ru" },
  tr: { label: "Türkçe", flag: "🇹🇷", htmlLang: "tr" },
  id: { label: "Bahasa Indonesia", flag: "🇮🇩", htmlLang: "id" },
  sv: { label: "Svenska", flag: "🇸🇪", htmlLang: "sv" },
  pl: { label: "Polski", flag: "🇵🇱", htmlLang: "pl" },
  th: { label: "ไทย", flag: "🇹🇭", htmlLang: "th" },
  vi: { label: "Tiếng Việt", flag: "🇻🇳", htmlLang: "vi" },
  da: { label: "Dansk", flag: "🇩🇰", htmlLang: "da" },
  no: { label: "Norsk", flag: "🇳🇴", htmlLang: "no" },
};

export function isAppLocale(value: string | null | undefined): value is AppLocale {
  return Boolean(value && (locales as readonly string[]).includes(value));
}
