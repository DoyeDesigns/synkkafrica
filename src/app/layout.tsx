import type { Metadata } from "next";

import { Navbar } from "@/components/layout/NavBar";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "SynkkAfrica",
  description: "SynkkAfrica is an african travel platform — connecting travellers to flights, ground transport, luxury rides, and deeply curated African cultural experiences",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col font-inter text-foreground">
        <QueryProvider>
          <Navbar />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
