"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  adminApproveListing,
  adminApproveListingDocument,
  adminGetListing,
  adminListingDocViewUrl,
  adminRejectListing,
  adminRejectListingDocument,
  adminRemoveListing,
  type AdminListing,
  type AdminListingDocument,
} from "@/lib/api/admin";
import { LIVE_QUERY_OPTIONS } from "@/lib/live-query-options";
import {
  confirmRemoveListing,
  formatAdminDate,
} from "@/features/admin/components/admin-listings-live-content";
import { ReviewStepPage } from "@/features/vendor/components/vendor-add-listing-review-step";
import {
  formStateFromListingDetails,
  type AddListingFormState,
  type ListingDocumentId,
} from "@/features/vendor/data/vendor-add-listing";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

const BACK_LABEL_KEYS: Record<AdminListing["category"], TranslationKey> = {
  cars: "admin.listings.detail.backCars",
  accommodations: "admin.listings.detail.backAccommodations",
  experiences: "admin.listings.detail.backExperiences",
};

// Booking statuses in lifecycle order for the "bookings by status" strip.
const BOOKING_STATUS_ORDER = [
  "awaiting_confirmation",
  "confirmed",
  "completed",
  "declined",
  "cancelled",
];

function bookingStatusLabel(status: string) {
  return status.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

const formatDate = formatAdminDate;

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

const LISTING_STATUS_STYLES: Record<AdminListing["status"], string> = {
  draft: "bg-[#F5F5F5] text-[#676565]",
  pending: "bg-[#FDF3EF] text-[#D85A30]",
  live: "bg-[#E7F6EC] text-[#2E7D32]",
  paused: "bg-[#FFF4E5] text-[#9A7200]",
  rejected: "bg-[#FDEBEB] text-[#C0392B]",
};

const DOC_STATUS_STYLES: Record<AdminListingDocument["status"], string> = {
  pending: "bg-[#FDF3EF] text-[#D85A30]",
  approved: "bg-[#E7F6EC] text-[#2E7D32]",
  rejected: "bg-[#FDEBEB] text-[#C0392B]",
};

// Friendly names for the per-listing compliance document types (car,
// accommodation and experience categories share this set).
const DOC_LABELS: Record<string, string> = {
  cac: "CAC Registration Certificate",
  ownership: "Proof of Ownership",
  proof_of_ownership: "Proof of Ownership",
  address_photos: "Photos Matching Listed Address",
  roadworthiness: "Roadworthiness Certificate",
  insurance: "Insurance Certificate",
  agent_authorization: "Agent Authorization Letter",
  agent_proof_of_address: "Agent Proof of Address",
};

function docLabel(type: string) {
  return (
    DOC_LABELS[type] ??
    type
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

export function AdminListingDetailLiveContent({
  listingId,
}: {
  listingId: string;
}) {
  const t = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  // The list view's query (search / tab / sort / page) passed along by the
  // list so "Back" returns to the same view. Only plain query strings allowed.
  const backQs = (searchParams.get("back") ?? "").replace(/^\?/, "");
  const listHref = (category: AdminListing["category"], extra?: Record<string, string>) => {
    const qs = new URLSearchParams(backQs);
    for (const [k, v] of Object.entries(extra ?? {})) qs.set(k, v);
    const str = qs.toString();
    return `/admin/${category}${str ? `?${str}` : ""}`;
  };
  const { data: session } = useSession();
  const token = session?.accessToken;
  const queryClient = useQueryClient();

  const {
    data: listing,
    isLoading,
    error: loadError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["admin-listing", listingId],
    queryFn: () => adminGetListing(token as string, listingId),
    enabled: Boolean(token),
    ...LIVE_QUERY_OPTIONS,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-listing", listingId] });
    void queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
  };

  // One inline error for every action on this page (moderation + documents).
  const [actionError, setActionError] = useState<string | null>(null);

  const approveMutation = useMutation({
    mutationFn: () => adminApproveListing(token as string, listingId),
    onMutate: () => setActionError(null),
    onSuccess: invalidate,
    // 409 when the listing is no longer pending or the vendor isn't verified.
    onError: (err) => {
      setActionError(errorMessage(err, "Couldn't approve this listing."));
      invalidate();
    },
  });
  const rejectMutation = useMutation({
    mutationFn: (reason?: string) =>
      adminRejectListing(token as string, listingId, reason),
    onMutate: () => setActionError(null),
    onSuccess: invalidate,
    onError: (err) => {
      setActionError(errorMessage(err, "Couldn't reject this listing."));
      invalidate();
    },
  });
  const removeMutation = useMutation({
    mutationFn: () => adminRemoveListing(token as string, listingId),
    onMutate: () => setActionError(null),
    onSuccess: () => {
      const category = listing?.category;
      queryClient.removeQueries({ queryKey: ["admin-listing", listingId] });
      void queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
      // The list shows a "removed" success banner from this param.
      router.push(
        category
          ? listHref(category, { removed: listing?.title ?? "Listing" })
          : "/admin",
      );
    },
    // 409 while bookings are still in progress — the message explains it.
    onError: (err) =>
      setActionError(errorMessage(err, "Couldn't remove this listing.")),
  });
  const busy =
    approveMutation.isPending || rejectMutation.isPending || removeMutation.isPending;

  const [docBusyId, setDocBusyId] = useState<string | null>(null);
  const docMutation = useMutation({
    mutationFn: (v: { id: string; action: "approve" | "reject"; reason?: string }) =>
      v.action === "approve"
        ? adminApproveListingDocument(token as string, v.id)
        : adminRejectListingDocument(token as string, v.id, v.reason),
    onMutate: ({ id }) => {
      setActionError(null);
      setDocBusyId(id);
    },
    onSuccess: invalidate,
    onError: (err, { action }) =>
      setActionError(
        errorMessage(
          err,
          action === "approve"
            ? "Couldn't approve this document."
            : "Couldn't reject this document.",
        ),
      ),
    onSettled: () => setDocBusyId(null),
  });

  const handleViewDoc = (id: string) => {
    const win = window.open("", "_blank");
    adminListingDocViewUrl(token as string, id)
      .then(({ url }) => {
        if (win) win.location.href = url;
      })
      .catch((err) => {
        win?.close();
        setActionError(errorMessage(err, "Couldn't open this document."));
      });
  };

  // The cover image plus any valid media entries (test data sometimes stores
  // malformed media like `[[], []]`, so guard for a real url). De-duplicated.
  const imageUrls = Array.from(
    new Set(
      [
        listing?.coverImageUrl ?? undefined,
        ...(listing?.media ?? []).map((m) => m?.url),
      ].filter((u): u is string => Boolean(u)),
    ),
  );

  const bookingStatuses = Object.entries(listing?.bookingsByStatus ?? {})
    .filter((e): e is [string, number] => typeof e[1] === "number" && e[1] > 0)
    .sort(([a], [b]) => {
      const ia = BOOKING_STATUS_ORDER.indexOf(a);
      const ib = BOOKING_STATUS_ORDER.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });

  // The vendor's full listing form, rendered with the vendor review screen.
  const reviewForm = useMemo(
    () => {
      if (!listing) return null;
      const form = formStateFromListingDetails(
        listing.category,
        listing.details,
        listing.media,
        listing.coverImageUrl,
      );
      // Show the vendor's real uploaded documents (by file name) in the
      // review's documents block; review/approval happens in the section below.
      const uploadedDocuments: AddListingFormState["uploadedDocuments"] = {};
      for (const doc of listing.documents) {
        const id = (doc.type === "ownership" ? "proof_of_ownership" : doc.type) as ListingDocumentId;
        uploadedDocuments[id] ??= { name: doc.fileName, status: "uploaded" };
      }
      return { ...form, uploadedDocuments };
    },
    [listing],
  );

  return (
    <section className="space-y-6">
      {listing ? (
        <Link
          href={listHref(listing.category)}
          className="inline-flex items-center gap-2 rounded text-sm font-medium font-satoshi text-[#135391] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[#135391]"
        >
          <ArrowLeft className="h-4 w-4" />
          {t(BACK_LABEL_KEYS[listing.category])}
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 rounded text-sm font-bold font-satoshi text-[#135391] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[#135391]"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          Back
        </button>
      )}

      {loadError && !listing ? (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-lg border border-[#F5C6C6] bg-[#FDEBEB] px-4 py-3 text-sm font-medium font-satoshi text-[#C0392B] sm:flex-row sm:items-center sm:justify-between"
        >
          <span>{errorMessage(loadError, "Couldn't load this listing.")}</span>
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="shrink-0 rounded-lg border border-[#C0392B] px-3 py-1.5 text-xs font-bold outline-none hover:bg-white focus-visible:ring-2 focus-visible:ring-[#C0392B] disabled:opacity-60"
          >
            {isFetching ? "Retrying…" : "Retry"}
          </button>
        </div>
      ) : isLoading || !token || !listing ? (
        !isLoading && token && !listing ? (
          <p className="text-sm font-medium font-satoshi text-[#676565]">
            Listing not found.
          </p>
        ) : (
          <DetailSkeleton />
        )
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold font-satoshi text-[#2F2F2F]">
                {listing.title}
              </h1>
              <p className="mt-1 text-sm font-medium font-satoshi text-[#676565] capitalize">
                {listing.category} · {listing.location ?? "—"} ·{" "}
                <Link
                  href={`/admin/vendors/${listing.vendorId}`}
                  className="text-[#135391] hover:underline"
                >
                  {listing.vendorName}
                </Link>
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold font-satoshi capitalize ${LISTING_STATUS_STYLES[listing.status]}`}
              >
                {listing.status}
              </span>
              {listing.status === "pending" ? (
                <>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => approveMutation.mutate()}
                    className="rounded-lg bg-[#2E7D32] px-3 py-2 text-xs font-bold font-satoshi text-white disabled:opacity-60"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      const reason = window.prompt(
                        "Reason for rejection (shown to the vendor):",
                      );
                      // Cancelled prompt → don't reject.
                      if (reason === null) return;
                      rejectMutation.mutate(reason.trim() || undefined);
                    }}
                    className="rounded-lg border border-[#E5E5E5] px-3 py-2 text-xs font-bold font-satoshi text-[#C0392B] disabled:opacity-60"
                  >
                    Reject
                  </button>
                </>
              ) : null}
              <button
                type="button"
                disabled={busy}
                aria-label={`Remove ${listing.title} permanently`}
                onClick={() => {
                  if (!confirmRemoveListing(listing.title)) return;
                  removeMutation.mutate();
                }}
                className="rounded-lg border border-[#F5C6C6] bg-white px-3 py-2 text-xs font-bold font-satoshi text-[#DD2222] hover:bg-[#FFF5F5] disabled:opacity-60"
              >
                {removeMutation.isPending ? "Removing…" : "Remove"}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm">
            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-[#FAFAFA] px-3 py-2.5">
                <dt className="text-xs font-medium font-satoshi text-[#676565]">
                  {t("admin.listings.bookings")}
                </dt>
                <dd className="mt-1 text-sm font-bold font-satoshi text-[#2F2F2F]">
                  {listing.bookingCount}
                </dd>
              </div>
              <div className="rounded-lg bg-[#FAFAFA] px-3 py-2.5">
                <dt className="text-xs font-medium font-satoshi text-[#676565]">
                  {t("admin.listings.ratings")}
                </dt>
                <dd className="mt-1 text-sm font-bold font-satoshi text-[#D85A30]">
                  {listing.ratingCount > 0 ? Number(listing.ratingAvg).toFixed(1) : "—"}{" "}
                  <span className="font-medium text-[#676565]">
                    ({listing.ratingCount} {t("admin.listings.reviews")})
                  </span>
                </dd>
              </div>
              <div className="rounded-lg bg-[#FAFAFA] px-3 py-2.5">
                <dt className="text-xs font-medium font-satoshi text-[#676565]">
                  {t("admin.listings.vendor")}
                </dt>
                <dd className="mt-1 text-sm font-bold font-satoshi text-[#2F2F2F]">
                  <Link
                    href={`/admin/vendors/${listing.vendorId}`}
                    className="hover:underline"
                  >
                    {listing.vendorName}
                  </Link>
                  {listing.vendorStatus ? (
                    <span className="ml-1 text-xs font-medium capitalize text-[#676565]">
                      ({listing.vendorStatus})
                    </span>
                  ) : null}
                </dd>
              </div>
              <div className="rounded-lg bg-[#FAFAFA] px-3 py-2.5">
                <dt className="text-xs font-medium font-satoshi text-[#676565]">
                  Created
                </dt>
                <dd className="mt-1 text-sm font-bold font-satoshi text-[#2F2F2F]">
                  {formatDate(listing.createdAt)}
                </dd>
                {listing.updatedAt ? (
                  <p className="mt-0.5 text-xs font-medium font-satoshi text-[#676565]">
                    Updated {formatDate(listing.updatedAt)}
                  </p>
                ) : null}
              </div>
            </dl>
            {bookingStatuses.length > 0 ? (
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase font-satoshi text-[#676565]">
                  Bookings by status
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {bookingStatuses.map(([status, n]) => (
                    <span
                      key={status}
                      className="rounded-full border border-[#EEEEEE] bg-[#FAFAFA] px-3 py-1 text-xs font-semibold font-satoshi text-[#2F2F2F]"
                    >
                      {bookingStatusLabel(status)}: {n}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {actionError ? (
            <div
              role="alert"
              className="flex items-start justify-between gap-3 rounded-lg border border-[#FDEBEB] bg-[#FDEBEB] px-4 py-3 text-sm font-medium font-satoshi text-[#C0392B]"
            >
              <span>{actionError}</span>
              <button
                type="button"
                onClick={() => setActionError(null)}
                className="shrink-0 font-bold hover:underline"
              >
                Dismiss
              </button>
            </div>
          ) : null}
          {listing.status !== "pending" ? (
            <p className="text-xs font-medium font-satoshi text-[#676565]">
              Only listings awaiting review can be approved or rejected.
            </p>
          ) : null}
          {listing.status === "rejected" && listing.rejectionReason ? (
            <p className="rounded-lg border border-[#FDEBEB] bg-[#FDEBEB] px-4 py-3 text-sm font-medium font-satoshi text-[#C0392B]">
              {listing.rejectionReason}
            </p>
          ) : null}

          {/* Media */}
          <div className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold font-satoshi text-[#2F2F2F]">
              Media ({imageUrls.length})
            </h2>
            {imageUrls.length === 0 ? (
              <p className="mt-3 text-sm font-medium font-satoshi text-[#676565]">
                No media uploaded.
              </p>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {imageUrls.map((url, i) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block overflow-hidden rounded-lg border border-[#EEEEEE]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Media ${i + 1}`}
                      className="h-32 w-full object-cover"
                    />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          {listing.shortDescription ? (
            <div className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm">
              <h2 className="text-base font-bold font-satoshi text-[#2F2F2F]">
                Description
              </h2>
              <p className="mt-3 whitespace-pre-wrap text-sm font-medium font-satoshi text-[#2F2F2F]">
                {listing.shortDescription}
              </p>
            </div>
          ) : null}

          {/* Full listing details (same view the vendor reviews before submitting) */}
          {reviewForm ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold font-satoshi text-[#2F2F2F]">
                  {t("admin.listings.detailTitle")}
                </h2>
                <p className="mt-1 text-xs font-medium font-satoshi text-[#676565]">
                  {t("admin.listings.detailHint")}
                </p>
              </div>
              <ReviewStepPage form={reviewForm} showIntro={false} />
            </div>
          ) : null}

          {/* Compliance documents */}
          <div className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold font-satoshi text-[#2F2F2F]">
              Compliance documents
            </h2>
            {listing.documents.length === 0 ? (
              <p className="mt-3 text-sm font-medium font-satoshi text-[#676565]">
                No documents uploaded.
              </p>
            ) : (
              <div className="mt-4 space-y-2">
                {listing.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex flex-col gap-2 rounded-lg border border-[#EEEEEE] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold font-satoshi text-[#2F2F2F]">
                        {docLabel(doc.type)}
                      </p>
                      <p className="mt-0.5 truncate text-xs font-medium font-satoshi text-[#676565]">
                        {doc.fileName}
                      </p>
                      {doc.status === "rejected" && doc.rejectionReason ? (
                        <p className="mt-0.5 text-xs font-medium font-satoshi text-[#C0392B]">
                          {doc.rejectionReason}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {doc.fileUrl ? (
                        <button
                          type="button"
                          onClick={() => handleViewDoc(doc.id)}
                          className="text-xs font-bold font-satoshi text-[#135391] underline"
                        >
                          View
                        </button>
                      ) : (
                        <span className="text-xs font-medium font-satoshi italic text-[#9A9A9A]">
                          No file uploaded
                        </span>
                      )}
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold font-satoshi capitalize ${DOC_STATUS_STYLES[doc.status]}`}
                      >
                        {doc.status}
                      </span>
                      {doc.status !== "approved" ? (
                        <button
                          type="button"
                          disabled={docBusyId !== null}
                          onClick={() =>
                            docMutation.mutate({ id: doc.id, action: "approve" })
                          }
                          className="rounded-lg bg-[#2E7D32] px-3 py-1.5 text-xs font-bold font-satoshi text-white disabled:opacity-60"
                        >
                          {docBusyId === doc.id ? "…" : "Approve"}
                        </button>
                      ) : null}
                      {doc.status !== "rejected" ? (
                        <button
                          type="button"
                          disabled={docBusyId !== null}
                          onClick={() => {
                            const reason = window.prompt(
                              "Why is this document rejected? (shown to the vendor)",
                            );
                            if (reason === null) return;
                            docMutation.mutate({
                              id: doc.id,
                              action: "reject",
                              reason: reason.trim() || undefined,
                            });
                          }}
                          className="rounded-lg border border-[#E5E5E5] px-3 py-1.5 text-xs font-bold font-satoshi text-[#C0392B] disabled:opacity-60"
                        >
                          Reject
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}

// Placeholder matching the loaded layout: header, stats strip, media grid.
function DetailSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading listing">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-64 animate-pulse rounded bg-[#EEEEEE]" />
          <div className="h-4 w-80 animate-pulse rounded bg-[#F3F3F3]" />
        </div>
        <div className="flex gap-2">
          <div className="h-7 w-16 animate-pulse rounded-full bg-[#F3F3F3]" />
          <div className="h-8 w-20 animate-pulse rounded-lg bg-[#F3F3F3]" />
        </div>
      </div>
      <div className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-[#F5F5F5]" />
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm">
        <div className="h-5 w-28 animate-pulse rounded bg-[#EEEEEE]" />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-[#F5F5F5]" />
          ))}
        </div>
      </div>
    </div>
  );
}
