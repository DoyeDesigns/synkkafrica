"use client";

import {
  AlertCircle,
  Car,
  ChevronDown,
  FileText,
  Plus,
  Upload,
} from "lucide-react";
import { useMemo, useState } from "react";

import {
  formatVendorDocumentDate,
  summarizeListingDocuments,
  VENDOR_BUSINESS_DOCUMENT,
  VENDOR_VEHICLE_LISTING_DOCUMENTS,
  type VendorDocumentStatus,
  type VendorVehicleDocument,
  type VendorVehicleDocumentType,
  type VendorVehicleListingDocuments,
} from "@/features/vendor/data/vendor-business-documents";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

const DOCUMENT_TYPE_LABEL_KEYS: Record<VendorVehicleDocumentType, TranslationKey> =
  {
    insurance: "vendor.businessProfile.documents.type.insurance",
    roadworthiness: "vendor.businessProfile.documents.type.roadworthiness",
    ownership: "vendor.businessProfile.documents.type.ownership",
  };

const DOCUMENT_STATUS_LABEL_KEYS: Record<VendorDocumentStatus, TranslationKey> = {
  verified: "vendor.businessProfile.documents.status.verified",
  rejected: "vendor.businessProfile.documents.status.rejected",
  pending: "vendor.businessProfile.documents.status.pending",
  not_uploaded: "vendor.businessProfile.documents.status.notUploaded",
};

const LISTING_STATUS_LABEL_KEYS = {
  all_verified: "vendor.businessProfile.documents.listingStatus.allVerified",
  action_needed: "vendor.businessProfile.documents.listingStatus.actionNeeded",
  not_started: "vendor.businessProfile.documents.listingStatus.notStarted",
  in_progress: "vendor.businessProfile.documents.listingStatus.inProgress",
} as const;

const STATUS_BADGE_STYLES: Record<VendorDocumentStatus, string> = {
  verified: "bg-[#E8F5E9] text-[#2E7D32]",
  rejected: "bg-[#FDEBEB] text-[#C0392B]",
  pending: "bg-[#FFF3E0] text-[#E65100]",
  not_uploaded: "bg-[#F5F5F5] text-[#676565]",
};

const LISTING_STATUS_BADGE_STYLES = {
  all_verified: "bg-[#E8F5E9] text-[#2E7D32]",
  action_needed: "bg-[#FFF3E0] text-[#E65100]",
  not_started: "bg-[#F5F5F5] text-[#676565]",
  in_progress: "bg-[#E3F2FD] text-[#1565C0]",
} as const;

const PROGRESS_BAR_STYLES = {
  all_verified: "bg-[#2E7D32]",
  action_needed: "bg-[#D85A30]",
  not_started: "bg-[#E5E5E5]",
  in_progress: "bg-[#1565C0]",
} as const;

export function VendorBusinessDocumentsSection() {
  const t = useTranslation();
  const [expandedListingId, setExpandedListingId] = useState<string | null>(
    "vehicle-2",
  );

  const listingCount = VENDOR_VEHICLE_LISTING_DOCUMENTS.length;

  return (
    <section className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E3F2FD] text-[#1565C0]">
          <FileText className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold font-satoshi text-[#2F2F2F]">
            {t("vendor.businessProfile.documents.title")}
          </h3>
          <p className="mt-1 text-xs font-medium font-satoshi text-[#676565]">
            {t("vendor.businessProfile.documents.subtitle")}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-[11px] font-bold tracking-wide font-satoshi text-[#676565] uppercase">
          {t("vendor.businessProfile.documents.businessSection")}
        </p>

        <BusinessDocumentRow document={VENDOR_BUSINESS_DOCUMENT} />
      </div>

      <div className="mt-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] font-bold tracking-wide font-satoshi text-[#676565] uppercase">
            {t("vendor.businessProfile.documents.vehicleSection", {
              count: listingCount,
            })}
          </p>
          <p className="text-[11px] font-medium font-satoshi text-[#676565]">
            {t("vendor.businessProfile.documents.vehicleLegend")}
          </p>
        </div>

        <div className="mt-3 space-y-3">
          {VENDOR_VEHICLE_LISTING_DOCUMENTS.map((listing) => (
            <VehicleListingAccordion
              key={listing.id}
              listing={listing}
              isExpanded={expandedListingId === listing.id}
              onToggle={() =>
                setExpandedListingId((current) =>
                  current === listing.id ? null : listing.id,
                )
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function BusinessDocumentRow({
  document,
}: {
  document: typeof VENDOR_BUSINESS_DOCUMENT;
}) {
  const t = useTranslation();

  return (
    <div className="mt-3 flex flex-col gap-3 rounded-lg border border-[#EEEEEE] bg-[#FAFAFA] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#676565]">
          <FileText className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold font-satoshi text-[#2F2F2F]">
            {t(document.nameKey)}
          </p>
          <p className="mt-1 text-xs font-medium font-satoshi text-[#676565]">
            {t("vendor.businessProfile.documents.uploadedMeta", {
              date: formatVendorDocumentDate(document.uploadedAt),
              fileName: document.fileName,
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:shrink-0">
        <StatusBadge
          label={t(DOCUMENT_STATUS_LABEL_KEYS.verified)}
          className={STATUS_BADGE_STYLES.verified}
        />
        <button
          type="button"
          className="text-sm font-semibold font-satoshi text-[#135391] transition-opacity hover:opacity-80"
        >
          {t("vendor.businessProfile.documents.view")}
        </button>
      </div>
    </div>
  );
}

function VehicleListingAccordion({
  listing,
  isExpanded,
  onToggle,
}: {
  listing: VendorVehicleListingDocuments;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const t = useTranslation();
  const summary = useMemo(
    () => summarizeListingDocuments(listing.documents),
    [listing.documents],
  );

  const progressPercent = (summary.verifiedCount / summary.totalCount) * 100;

  return (
    <div className="overflow-hidden rounded-lg border border-[#EEEEEE]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-[#FAFAFA]"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E3F2FD] text-[#1565C0]">
          <Car className="h-5 w-5" strokeWidth={1.75} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold font-satoshi text-[#2F2F2F]">
            {listing.vehicleName}
          </p>
          <p className="mt-0.5 text-xs font-medium font-satoshi text-[#676565]">
            {listing.plateNumber}
          </p>
        </div>

        <div className="hidden min-w-[120px] flex-col gap-1.5 sm:flex">
          <div className="h-1.5 overflow-hidden rounded-full bg-[#EEEEEE]">
            <div
              className={`h-full rounded-full transition-all ${PROGRESS_BAR_STYLES[summary.listingStatus]}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-right text-[11px] font-medium font-satoshi text-[#676565]">
            {summary.verifiedCount}/{summary.totalCount}
          </p>
        </div>

        <StatusBadge
          label={t(LISTING_STATUS_LABEL_KEYS[summary.listingStatus])}
          className={LISTING_STATUS_BADGE_STYLES[summary.listingStatus]}
        />

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[#676565] transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
          strokeWidth={1.75}
        />
      </button>

      {isExpanded ? (
        <div className="border-t border-[#EEEEEE] bg-[#FAFAFA] px-4 py-4">
          <div className="mb-3 flex items-center gap-3 sm:hidden">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#EEEEEE]">
              <div
                className={`h-full rounded-full ${PROGRESS_BAR_STYLES[summary.listingStatus]}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[11px] font-medium font-satoshi text-[#676565]">
              {summary.verifiedCount}/{summary.totalCount}
            </span>
          </div>

          <div className="space-y-3">
            {listing.documents.map((document) => (
              <VehicleDocumentRow key={document.id} document={document} />
            ))}
          </div>

          {summary.rejectedDocument?.rejectionReasonKey ? (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-[#F5C6CB] bg-[#FDEBEB] px-3 py-3">
              <AlertCircle
                className="mt-0.5 h-4 w-4 shrink-0 text-[#C0392B]"
                strokeWidth={1.75}
              />
              <p className="text-xs font-medium font-satoshi leading-relaxed text-[#C0392B]">
                {t(summary.rejectedDocument.rejectionReasonKey)}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function VehicleDocumentRow({ document }: { document: VendorVehicleDocument }) {
  const t = useTranslation();
  const isRejected = document.status === "rejected";

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-[#EEEEEE] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            isRejected ? "bg-[#FDEBEB] text-[#C0392B]" : "bg-[#F5F5F5] text-[#676565]"
          }`}
        >
          <FileText className="h-4 w-4" strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold font-satoshi text-[#2F2F2F]">
            {t(DOCUMENT_TYPE_LABEL_KEYS[document.type])}
          </p>
          {document.uploadedAt && document.fileName ? (
            <p className="mt-0.5 text-xs font-medium font-satoshi text-[#676565]">
              {t("vendor.businessProfile.documents.uploadedMeta", {
                date: formatVendorDocumentDate(document.uploadedAt),
                fileName: document.fileName,
              })}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-3 sm:shrink-0">
        <StatusBadge
          label={t(DOCUMENT_STATUS_LABEL_KEYS[document.status])}
          className={STATUS_BADGE_STYLES[document.status]}
        />

        {document.status === "verified" ? (
          <button
            type="button"
            className="text-sm font-semibold font-satoshi text-[#135391] transition-opacity hover:opacity-80"
          >
            {t("vendor.businessProfile.documents.view")}
          </button>
        ) : document.status === "rejected" ? (
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#D85A30] px-3 py-2 text-xs font-bold font-satoshi text-white transition-opacity hover:opacity-90">
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            {t("vendor.businessProfile.documents.reupload")}
            <input type="file" accept="application/pdf,image/*" className="sr-only" />
          </label>
        ) : document.status === "not_uploaded" ? (
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#E5E5E5] bg-white px-3 py-2 text-xs font-semibold font-satoshi text-[#135391] transition-colors hover:bg-[#F5F5F5]">
            <Upload className="h-3.5 w-3.5" strokeWidth={1.75} />
            {t("vendor.businessProfile.documents.upload")}
            <input type="file" accept="application/pdf,image/*" className="sr-only" />
          </label>
        ) : null}
      </div>
    </div>
  );
}

function StatusBadge({ label, className }: { label: string; className: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold font-satoshi ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
