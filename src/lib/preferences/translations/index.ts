export type { TranslationKey, Messages } from "@/i18n/types";

/**
 * Legacy imperative helper for rare non-hook call sites.
 * Prefer `useTranslation()` in React components.
 */
export function translate(
  _language: string,
  key: string,
  params?: Record<string, string | number>,
): string {
  let text = key;

  if (params) {
    for (const [paramKey, value] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, "g"), String(value));
    }
  }

  return text;
}
