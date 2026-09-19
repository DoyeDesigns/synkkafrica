import {
  localeLabels,
  locales,
  type AppLocale,
} from "@/i18n/config";

export type LanguageOption = {
  code: AppLocale;
  label: string;
  flag: string;
  htmlLang: string;
};

export const LANGUAGES: LanguageOption[] = locales.map((code) => ({
  code,
  ...localeLabels[code],
}));

export function getLanguageOption(code: string) {
  return LANGUAGES.find((item) => item.code === code) ?? LANGUAGES[0];
}
