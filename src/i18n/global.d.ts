import en from "../messages/en.json";

declare module "next-intl" {
  interface AppConfig {
    Locale: import("@/i18n/config").AppLocale;
    Messages: typeof en;
  }
}
