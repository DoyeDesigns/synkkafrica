"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ADMIN_VENDOR_REQUESTABLE_DOCUMENTS } from "@/features/admin/data/admin-vendors";
import { useTranslation } from "@/hooks/use-translation";

const CUSTOM_DOCUMENT_VALUE = "custom";

type AdminRequestDocumentsModalProps = {
  open: boolean;
  vendorName: string;
  onClose: () => void;
  onSubmit?: (documentName: string) => void;
};

export function AdminRequestDocumentsModal({
  open,
  vendorName,
  onClose,
  onSubmit,
}: AdminRequestDocumentsModalProps) {
  const t = useTranslation();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [selectedDocument, setSelectedDocument] = useState("");
  const [customDocumentName, setCustomDocumentName] = useState("");

  const isCustom = selectedDocument === CUSTOM_DOCUMENT_VALUE;
  const resolvedDocumentName = isCustom
    ? customDocumentName.trim()
    : selectedDocument.trim();
  const canSubmit = resolvedDocumentName.length > 0;

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setSelectedDocument("");
      setCustomDocumentName("");
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }

    onSubmit?.(resolvedDocumentName);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-documents-title"
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="space-y-1">
          <h3
            id="request-documents-title"
            className="text-xl font-bold font-satoshi text-[#2F2F2F]"
          >
            {t("admin.vendors.requestDocumentsModal.title")}
          </h3>
          <p className="text-sm font-medium font-satoshi text-[#676565]">
            {t("admin.vendors.requestDocumentsModal.subtitle", { vendor: vendorName })}
          </p>
        </div>

        <div className="mt-6 space-y-5">
          <FormField label={t("admin.vendors.requestDocumentsModal.documentLabel")}>
            <div className="relative">
              <select
                value={selectedDocument}
                onChange={(event) => setSelectedDocument(event.target.value)}
                className="h-11 w-full appearance-none rounded-lg border border-[#E5E5E5] bg-white pl-4 pr-10 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none focus:border-[#135391]"
              >
                <option value="">
                  {t("admin.vendors.requestDocumentsModal.documentPlaceholder")}
                </option>
                {ADMIN_VENDOR_REQUESTABLE_DOCUMENTS.map((document) => (
                  <option key={document} value={document}>
                    {document}
                  </option>
                ))}
                <option value={CUSTOM_DOCUMENT_VALUE}>
                  {t("admin.vendors.requestDocumentsModal.otherOption")}
                </option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]" />
            </div>
          </FormField>

          {isCustom ? (
            <FormField label={t("admin.vendors.requestDocumentsModal.customDocumentLabel")}>
              <input
                type="text"
                value={customDocumentName}
                onChange={(event) => setCustomDocumentName(event.target.value)}
                placeholder={t("admin.vendors.requestDocumentsModal.customDocumentPlaceholder")}
                className="h-11 w-full rounded-lg border border-[#E5E5E5] px-4 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none focus:border-[#135391]"
              />
            </FormField>
          ) : null}
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-[#E5E5E5] px-5 text-sm font-bold font-satoshi text-[#2F2F2F] transition-colors hover:bg-[#FAFAFA]"
          >
            {t("admin.vendors.requestDocumentsModal.cancel")}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-[#135391] px-5 text-sm font-bold font-satoshi text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("admin.vendors.requestDocumentsModal.submit")}
          </button>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-bold font-satoshi text-[#2F2F2F]">{label}</span>
      {children}
    </label>
  );
}
