import type { Metadata } from "next";

import { LegalDocumentPage } from "@/features/legal/legal-document-page";

export const metadata: Metadata = {
  title: "Privacy Policy | SynkAfrica",
};

export default function PrivacyPage() {
  return (
    <LegalDocumentPage
      title="Privacy Policy"
      file="/legal/privacy-policy.pdf"
    />
  );
}
