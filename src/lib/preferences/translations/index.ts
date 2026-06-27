import type { LanguageCode } from "@/lib/preferences/types";
import { en, type TranslationKey } from "./en";
import { fr } from "./fr";
import { es } from "./es";
import { de } from "./de";

export type { TranslationKey };
export { en, fr, es, de };

export const translations: Record<LanguageCode, Record<TranslationKey, string>> = {
  en,
  fr,
  es,
  de,
};

export function translate(
  language: LanguageCode,
  key: TranslationKey,
  params?: Record<string, string | number>,
): string {
  let text = translations[language][key] ?? translations.en[key];

  if (params) {
    for (const [paramKey, value] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, "g"), String(value));
    }
  }

  return text;
}
