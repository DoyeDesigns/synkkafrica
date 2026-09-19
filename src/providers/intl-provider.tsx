"use client";

import { NextIntlClientProvider } from "next-intl";
import { useEffect, useState, type ReactNode } from "react";

import { defaultLocale, isAppLocale, type AppLocale } from "@/i18n/config";
import { loadMessages, MESSAGE_CATALOG_VERSION } from "@/i18n/load-messages";
import { usePreferencesStore } from "@/stores/preferences-store";

type IntlProviderProps = {
  children: ReactNode;
  initialLocale: AppLocale;
  initialMessages: Record<string, unknown>;
};

export function IntlProvider({
  children,
  initialLocale,
  initialMessages,
}: IntlProviderProps) {
  const language = usePreferencesStore((state) => state.language);
  const locale: AppLocale = isAppLocale(language) ? language : defaultLocale;
  const [messages, setMessages] = useState(initialMessages);
  const [activeLocale, setActiveLocale] = useState(initialLocale);

  useEffect(() => {
    let cancelled = false;

    void loadMessages(locale).then((next) => {
      if (cancelled) return;
      setMessages(next);
      setActiveLocale(locale);
    });

    return () => {
      cancelled = true;
    };
  }, [locale, MESSAGE_CATALOG_VERSION]);

  return (
    <NextIntlClientProvider
      key={activeLocale}
      locale={activeLocale}
      messages={messages}
      timeZone="Africa/Lagos"
    >
      {children}
    </NextIntlClientProvider>
  );
}
