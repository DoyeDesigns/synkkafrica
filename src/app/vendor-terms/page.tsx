import type { Metadata } from "next";

import { LegalDocumentPage } from "@/features/legal/legal-document-page";

export const metadata: Metadata = {
  title: "Vendor Terms | SynkAfrica",
};

export default function VendorTermsPage() {
  return (
    <LegalDocumentPage title="Vendor Terms" file="/legal/vendor-terms.pdf" />
  );
}