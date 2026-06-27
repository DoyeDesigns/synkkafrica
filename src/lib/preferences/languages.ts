import type { LanguageCode } from "@/lib/preferences/types";

export type LanguageOption = {
  code: LanguageCode;
  label: string;
  flag: string;
  htmlLang: string;
};

export const LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English", flag: "🇬🇧", htmlLang: "en" },
  { code: "fr", label: "French", flag: "🇫🇷", htmlLang: "fr" },
  { code: "es", label: "Espanyól", flag: "🇪🇸", htmlLang: "es" },
  { code: "de", label: "German", flag: "🇩🇪", htmlLang: "de" },
];

export function getLanguageOption(code: LanguageCode) {
  return LANGUAGES.find((item) => item.code === code) ?? LANGUAGES[0];
}
