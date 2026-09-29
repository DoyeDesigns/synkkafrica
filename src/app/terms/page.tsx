import type { Metadata } from "next";

import { LegalDocumentPage } from "@/features/legal/legal-document-page";

export const metadata: Metadata = {
  title: "Terms of Service | SynkAfrica",
};

export default function TermsPage() {
  return (
    <LegalDocumentPage
      title="Terms of Service"
      file="/legal/terms-of-service.pdf"
    />
  );
}
