import type { Metadata } from "next";

import { LegalDocumentPage } from "@/features/legal/legal-document-page";

export const metadata: Metadata = {
  title: "Cookie Policy | SynkAfrica",
};

export default function CookiesPage() {
  return (
    <LegalDocumentPage title="Cookie Policy" file="/legal/cookie-policy.pdf" />
  );
}
