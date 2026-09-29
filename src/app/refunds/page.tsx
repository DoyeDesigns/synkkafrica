import type { Metadata } from "next";

import { LegalDocumentPage } from "@/features/legal/legal-document-page";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | SynkAfrica",
};

export default function RefundsPage() {
  return (
    <LegalDocumentPage
      title="Refund & Cancellation Policy"
      file="/legal/refund-cancellation-policy.pdf"
    />
  );
}
