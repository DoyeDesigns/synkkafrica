import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

import {
  defaultLocale,
  isAppLocale,
  LANGUAGE_COOKIE,
} from "@/i18n/config";
import { loadMessages } from "@/i18n/load-messages";

export default getRequestConfig(async () => {
  const store = await cookies();
  const raw = store.get(LANGUAGE_COOKIE)?.value;
  const locale = isAppLocale(raw) ? raw : defaultLocale;

  return {
    locale,
    messages: await loadMessages(locale),
  };
});
