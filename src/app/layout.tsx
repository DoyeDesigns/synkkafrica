import type { Metadata } from "next";

import { auth } from "@/auth";
import { ConditionalNavbar } from "@/components/layout/conditional-navbar";
import { ConditionalFooter } from "@/components/layout/conditional-footer";
import { resolveLocationPreferences } from "@/lib/preferences/resolve-location-preferences";
import { getLanguageOption } from "@/lib/preferences/languages";
import { PreferencesProvider } from "@/providers/preferences-provider";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/session-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "SynkkAfrica",
  description: "SynkkAfrica is an african travel platform — connecting travellers to flights, ground transport, luxury rides, and deeply curated African cultural experiences",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const detectedPreferences = await resolveLocationPreferences();
  const htmlLang = getLanguageOption(
    detectedPreferences?.language ?? "en",
  ).htmlLang;

  return (
    <html
      lang={htmlLang}
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col font-inter text-foreground">
        <AuthProvider session={session}>
          <QueryProvider>
            <PreferencesProvider detectedPreferences={detectedPreferences}>
              <ConditionalNavbar session={session} />
              <main className="flex-1">{children}</main>
              <ConditionalFooter />
            </PreferencesProvider>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
