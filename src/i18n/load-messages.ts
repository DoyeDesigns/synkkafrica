import { defaultLocale, type AppLocale } from "@/i18n/config";

type Messages = Record<string, unknown>;
type MessageModule = { default: Messages };

/**
 * Explicit loaders so Turbopack/Webpack include every catalog in the bundle.
 * Dynamic `import(\`.../${locale}.json\`)` often fails at runtime and silently
 * falls back to English — which looks like "language switch does nothing".
 */
const MESSAGE_LOADERS: Record<AppLocale, () => Promise<MessageModule>> = {
  en: () => import("../../messages/en.json"),
  fr: () => import("../../messages/fr.json"),
  es: () => import("../../messages/es.json"),
  de: () => import("../../messages/de.json"),
  pt: () => import("../../messages/pt.json"),
  ar: () => import("../../messages/ar.json"),
  zh: () => import("../../messages/zh.json"),
  ja: () => import("../../messages/ja.json"),
  hi: () => import("../../messages/hi.json"),
  it: () => import("../../messages/it.json"),
  nl: () => import("../../messages/nl.json"),
  ko: () => import("../../messages/ko.json"),
  ru: () => import("../../messages/ru.json"),
  tr: () => import("../../messages/tr.json"),
  id: () => import("../../messages/id.json"),
  sv: () => import("../../messages/sv.json"),
  pl: () => import("../../messages/pl.json"),
  th: () => import("../../messages/th.json"),
  vi: () => import("../../messages/vi.json"),
  da: () => import("../../messages/da.json"),
  no: () => import("../../messages/no.json"),
};

function isPlainObject(value: unknown): value is Messages {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/** Fill gaps in a locale catalog with English so new keys never render as raw paths. */
function mergeMessages(base: Messages, overlay: Messages): Messages {
  const result: Messages = { ...base };

  for (const [key, value] of Object.entries(overlay)) {
    const current = result[key];
    if (isPlainObject(current) && isPlainObject(value)) {
      result[key] = mergeMessages(current, value);
    } else {
      result[key] = value;
    }
  }

  return result;
}

export const MESSAGE_CATALOG_VERSION = 8;

export async function loadMessages(locale: string): Promise<Messages> {
  const resolved: AppLocale =
    locale in MESSAGE_LOADERS ? (locale as AppLocale) : defaultLocale;

  const english = (await MESSAGE_LOADERS[defaultLocale]()).default;

  if (resolved === defaultLocale) {
    return english;
  }

  try {
    const localized = (await MESSAGE_LOADERS[resolved]()).default;
    return mergeMessages(english, localized);
  } catch {
    return english;
  }
}
