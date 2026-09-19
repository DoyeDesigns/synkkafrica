import type { Metadata } from "next";
import { cookies } from "next/headers";

import { auth } from "@/auth";
import { ConditionalNavbar } from "@/components/layout/conditional-navbar";
import { ConditionalFooter } from "@/components/layout/conditional-footer";
import {
  defaultLocale,
  isAppLocale,
  LANGUAGE_COOKIE,
  type AppLocale,
} from "@/i18n/config";
import { loadMessages } from "@/i18n/load-messages";
import { resolveLocationPreferences } from "@/lib/preferences/resolve-location-preferences";
import { getLanguageOption } from "@/lib/preferences/languages";
import { IntlProvider } from "@/providers/intl-provider";
import { PreferencesProvider } from "@/providers/preferences-provider";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/session-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "SynkAfrica",
  description:
    "SynkAfrica is an african travel platform — connecting travellers to flights, ground transport, luxury rides, and deeply curated African cultural experiences",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const detectedPreferences = await resolveLocationPreferences();
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LANGUAGE_COOKIE)?.value;
  const initialLocale: AppLocale = isAppLocale(
    detectedPreferences?.language ?? cookieLocale,
  )
    ? ((detectedPreferences?.language ?? cookieLocale) as AppLocale)
    : defaultLocale;
  const initialMessages = await loadMessages(initialLocale);
  const htmlLang = getLanguageOption(initialLocale).htmlLang;

  return (
    <html lang={htmlLang} className="h-full antialiased">
      <body className="min-h-full flex flex-col font-inter text-foreground">
        <AuthProvider session={session}>
          <QueryProvider>
            <PreferencesProvider detectedPreferences={detectedPreferences}>
              <IntlProvider
                initialLocale={initialLocale}
                initialMessages={initialMessages}
              >
                <ConditionalNavbar session={session} />
                <main className="flex-1">{children}</main>
                <ConditionalFooter />
              </IntlProvider>
            </PreferencesProvider>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
