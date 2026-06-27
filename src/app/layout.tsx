import type { Metadata } from "next";

import { auth } from "@/auth";
import { ConditionalNavbar } from "@/components/layout/conditional-navbar";
import { ConditionalFooter } from "@/components/layout/conditional-footer";
import { PreferencesProvider } from "@/providers/preferences-provider";
import { QueryProvider } from "@/providers/query-provider";
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

  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col font-inter text-foreground">
        <QueryProvider>
          <PreferencesProvider>
            <ConditionalNavbar session={session} />
            <main className="flex-1">{children}</main>
            <ConditionalFooter />
          </PreferencesProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
