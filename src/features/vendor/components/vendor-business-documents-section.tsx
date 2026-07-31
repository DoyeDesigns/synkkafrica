"use client";

import {
  AlertCircle,
  Car,
  ChevronDown,
  FileText,
  Loader2,
  Plus,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";
import {
  getVendorDocuments,
  uploadListingDocument,
  type DocStatus,
  type VendorBusinessDocApi,
  type VendorListingDocApi,
  type VendorDocumentsOverview,
} from "@/lib/api/vendor";

const DOCUMENT_STATUS_LABEL_KEYS: Record<DocStatus, TranslationKey> = {
  verified: "vendor.businessProfile.documents.status.verified",
  rejected: "vendor.businessProfile.documents.status.rejected",
  pending: "vendor.businessProfile.documents.status.pending",
  not_uploaded: "vendor.businessProfile.documents.status.notUploaded",
};

type ListingStatus =
  | "all_verified"
  | "action_needed"
  | "not_started"
  | "in_progress";

const LISTING_STATUS_LABEL_KEYS: Record<ListingStatus, TranslationKey> = {
  all_verified: "vendor.businessProfile.documents.listingStatus.allVerified",
  action_needed: "vendor.businessProfile.documents.listingStatus.actionNeeded",
  not_started: "vendor.businessProfile.documents.listingStatus.notStarted",
  in_progress: "vendor.businessProfile.documents.listingStatus.inProgress",
};

const STATUS_BADGE_STYLES: Record<DocStatus, string> = {
  verified: "bg-[#E8F5E9] text-[#2E7D32]",
  rejected: "bg-[#FDEBEB] text-[#C0392B]",
  pending: "bg-[#FFF3E0] text-[#E65100]",
  not_uploaded: "bg-[#F5F5F5] text-[#676565]",
};

const LISTING_STATUS_BADGE_STYLES: Record<ListingStatus, string> = {
  all_verified: "bg-[#E8F5E9] text-[#2E7D32]",
  action_needed: "bg-[#FFF3E0] text-[#E65100]",
  not_started: "bg-[#F5F5F5] text-[#676565]",
  in_progress: "bg-[#E3F2FD] text-[#1565C0]",
};

const PROGRESS_BAR_STYLES: Record<ListingStatus, string> = {
  all_verified: "bg-[#2E7D32]",
  action_needed: "bg-[#D85A30]",
  not_started: "bg-[#E5E5E5]",
  in_progress: "bg-[#1565C0]",
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

type ListingRow = VendorDocumentsOverview["listings"][number];

function summarize(documents: VendorListingDocApi[]) {
  const total = documents.length;
  const verified = documents.filter((d) => d.status === "verified").length;
  const rejected = documents.find((d) => d.status === "rejected");
  let listingStatus: ListingStatus;
  if (verified === 0) listingStatus = "not_started";
  else if (verified === total) listingStatus = "all_verified";
  else if (rejected) listingStatus = "action_needed";
  else listingStatus = "in_progress";
  return { verified, total, listingStatus, rejected };
}

export function VendorBusinessDocumentsSection() {
  const t = useTranslation();
  const { data: session } = useSession();
  const token = session?.accessToken;
  const queryClient = useQueryClient();
  const [expandedListingId, setExpandedListingId] = useState<string | null>(
    null,
  );

  const { data, isLoading } = useQuery({
    queryKey: ["vendor-documents"],
    queryFn: () => getVendorDocuments(token as string),
    enabled: Boolean(token),
    refetchOnWindowFocus: false,
  });

  const uploadMutation = useMutation({
    mutationFn: (v: { listingId: string; type: string; fileName: string }) =>
      uploadListingDocument(token as string, v.listingId, v.type, v.fileName),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["vendor-documents"] }),
  });

  const business = data?.business ?? [];
  const listings = data?.listings ?? [];

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

      {isLoading ? (
        <div className="mt-6 flex items-center gap-2 text-sm font-medium font-satoshi text-[#676565]">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : (
        <>
          <div className="mt-6">
            <p className="text-[11px] font-bold tracking-wide font-satoshi text-[#676565] uppercase">
              {t("vendor.businessProfile.documents.businessSection")}
            </p>
            {business.length > 0 ? (
              business.map((doc) => (
                <BusinessDocumentRow key={doc.id} document={doc} />
              ))
            ) : (
              <p className="mt-3 rounded-lg border border-[#EEEEEE] bg-[#FAFAFA] px-4 py-4 text-sm font-medium font-satoshi text-[#676565]">
                No business documents uploaded yet.
              </p>
            )}
          </div>

          <div className="mt-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[11px] font-bold tracking-wide font-satoshi text-[#676565] uppercase">
                {t("vendor.businessProfile.documents.vehicleSection", {
                  count: listings.length,
                })}
              </p>
            </div>

            <div className="mt-3 space-y-3">
              {listings.length > 0 ? (
                listings.map((listing) => (
                  <ListingAccordion
                    key={listing.listingId}
                    listing={listing}
                    isExpanded={expandedListingId === listing.listingId}
                    onToggle={() =>
                      setExpandedListingId((current) =>
                        current === listing.listingId
                          ? null
                          : listing.listingId,
                      )
                    }
                    uploading={uploadMutation.isPending}
                    onUpload={(type, fileName) =>
                      uploadMutation.mutate({
                        listingId: listing.listingId,
                        type,
                        fileName,
                      })
                    }
                  />
                ))
              ) : (
                <p className="rounded-lg border border-[#EEEEEE] bg-[#FAFAFA] px-4 py-4 text-sm font-medium font-satoshi text-[#676565]">
                  No listings yet — create one to add its compliance documents.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function BusinessDocumentRow({
  document,
}: {
  document: VendorBusinessDocApi;
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
            {document.label}
          </p>
          <p className="mt-1 text-xs font-medium font-satoshi text-[#676565]">
            {t("vendor.businessProfile.documents.uploadedMeta", {
              date: formatDate(document.uploadedAt),
              fileName: document.fileName,
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:shrink-0">
        <StatusBadge
          label={t(DOCUMENT_STATUS_LABEL_KEYS[document.status])}
          className={STATUS_BADGE_STYLES[document.status]}
        />
      </div>
    </div>
  );
}

function ListingAccordion({
  listing,
  isExpanded,
  onToggle,
  uploading,
  onUpload,
}: {
  listing: ListingRow;
  isExpanded: boolean;
  onToggle: () => void;
  uploading: boolean;
  onUpload: (type: string, fileName: string) => void;
}) {
  const t = useTranslation();
  const summary = summarize(listing.documents);
  const progressPercent =
    summary.total > 0 ? (summary.verified / summary.total) * 100 : 0;

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
            {listing.title}
          </p>
          {listing.reference ? (
            <p className="mt-0.5 text-xs font-medium font-satoshi text-[#676565]">
              {listing.reference}
            </p>
          ) : null}
        </div>

        <div className="hidden min-w-[120px] flex-col gap-1.5 sm:flex">
          <div className="h-1.5 overflow-hidden rounded-full bg-[#EEEEEE]">
            <div
              className={`h-full rounded-full transition-all ${PROGRESS_BAR_STYLES[summary.listingStatus]}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-right text-[11px] font-medium font-satoshi text-[#676565]">
            {summary.verified}/{summary.total}
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
          <div className="space-y-3">
            {listing.documents.map((document) => (
              <DocumentRow
                key={document.type}
                document={document}
                uploading={uploading}
                onUpload={(fileName) => onUpload(document.type, fileName)}
              />
            ))}
          </div>

          {summary.rejected?.rejectionReason ? (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-[#F5C6CB] bg-[#FDEBEB] px-3 py-3">
              <AlertCircle
                className="mt-0.5 h-4 w-4 shrink-0 text-[#C0392B]"
                strokeWidth={1.75}
              />
              <p className="text-xs font-medium font-satoshi leading-relaxed text-[#C0392B]">
                {summary.rejected.rejectionReason}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function DocumentRow({
  document,
  uploading,
  onUpload,
}: {
  document: VendorListingDocApi;
  uploading: boolean;
  onUpload: (fileName: string) => void;
}) {
  const t = useTranslation();
  const isRejected = document.status === "rejected";

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onUpload(file.name);
    event.target.value = "";
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-[#EEEEEE] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            isRejected
              ? "bg-[#FDEBEB] text-[#C0392B]"
              : "bg-[#F5F5F5] text-[#676565]"
          }`}
        >
          <FileText className="h-4 w-4" strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold font-satoshi text-[#2F2F2F]">
            {document.label}
          </p>
          {document.uploadedAt && document.fileName ? (
            <p className="mt-0.5 text-xs font-medium font-satoshi text-[#676565]">
              {t("vendor.businessProfile.documents.uploadedMeta", {
                date: formatDate(document.uploadedAt),
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

        {document.status === "rejected" ? (
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#D85A30] px-3 py-2 text-xs font-bold font-satoshi text-white transition-opacity hover:opacity-90">
            {uploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            )}
            {t("vendor.businessProfile.documents.reupload")}
            <input
              type="file"
              accept="application/pdf,image/*"
              className="sr-only"
              onChange={handleFile}
            />
          </label>
        ) : document.status === "not_uploaded" ? (
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#E5E5E5] bg-white px-3 py-2 text-xs font-semibold font-satoshi text-[#135391] transition-colors hover:bg-[#F5F5F5]">
            {uploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="h-3.5 w-3.5" strokeWidth={1.75} />
            )}
            {t("vendor.businessProfile.documents.upload")}
            <input
              type="file"
              accept="application/pdf,image/*"
              className="sr-only"
              onChange={handleFile}
            />
          </label>
        ) : null}
      </div>
    </div>
  );
}

function StatusBadge({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold font-satoshi ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
