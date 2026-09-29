"use client";

import { ArrowLeft, Loader2, Pencil } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";

import { ReviewStepPage } from "@/features/vendor/components/vendor-add-listing-review-step";
import {
  formStateFromListingDetails,
  toListingCurrency,
} from "@/features/vendor/data/vendor-add-listing";
import { VENDOR_CATEGORY_KEY } from "@/features/vendor/vendor-listing-mappers";
import { VENDOR_QUERY_KEYS } from "@/features/vendor/vendor-query-keys";
import { useTranslation } from "@/hooks/use-translation";
import { ApiError } from "@/lib/api/backend";
import { getVendorListing, type VendorListingStatus } from "@/lib/api/vendor";
import { LIVE_QUERY_OPTIONS } from "@/lib/live-query-options";
import type { TranslationKey } from "@/lib/preferences/translations";

type VendorListingDetailContentProps = {
  listingId: string;
};

const STATUS_LABEL_KEYS: Record<VendorListingStatus, TranslationKey> = {
  live: "vendor.dashboard.status.live",
  pending: "vendor.listings.status.pendingApproval",
  paused: "vendor.dashboard.status.paused",
  draft: "vendor.dashboard.status.draft",
  rejected: "vendor.dashboard.status.rejected",
};

export function VendorListingDetailContent({
  listingId,
}: VendorListingDetailContentProps) {
  const t = useTranslation();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();
  const token = session?.accessToken;
  const fromBookings = searchParams.get("from") === "bookings";
  const backHref = fromBookings ? "/vendor/bookings" : "/vendor/listings";
  const backLabel = fromBookings
    ? t("vendor.listings.detail.backToBookings")
    : t("vendor.listings.detail.back");

  const {
    data: listing,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: VENDOR_QUERY_KEYS.listing(listingId),
    queryFn: () => getVendorListing(token as string, listingId),
    enabled: Boolean(token && listingId),
    // A 404 won't fix itself; don't retry it.
    retry: (count, err) =>
      !(err instanceof ApiError && err.status === 404) && count < 2,
    ...LIVE_QUERY_OPTIONS,
  });

  // Rebuild the wizard's form state from the persisted listing so the detail
  // page renders exactly what the vendor entered (same helper as Edit).
  const form = useMemo(() => {
    if (!listing) return null;
    const next = formStateFromListingDetails(
      listing.category,
      listing.details,
      listing.media,
      listing.coverImageUrl,
    );
    if (listing.currency) next.currency = toListingCurrency(listing.currency);
    return next;
  }, [listing]);

  const backLink = (
    <Link
      href={backHref}
      className="inline-flex items-center gap-2 text-sm font-medium font-satoshi text-[#135391] hover:underline"
    >
      <ArrowLeft className="h-4 w-4" />
      {backLabel}
    </Link>
  );

  if (isLoading || (sessionStatus === "loading" && !listing)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-sm font-medium font-satoshi text-[#676565]">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t("common.loading")}
      </div>
    );
  }

  if (error || !form || !listing) {
    const notFound =
      !error || (error instanceof ApiError && error.status === 404);
    return (
      <div className="rounded-xl border border-[#EEEEEE] bg-white p-8 text-center shadow-sm">
        <p
          className={`text-sm font-medium font-satoshi ${
            notFound ? "text-[#676565]" : "text-[#C0392B]"
          }`}
        >
          {notFound
            ? t("vendor.listings.detail.notFound")
            : t("vendor.addListing.loadError")}
        </p>
        <div className="mt-4 flex items-center justify-center gap-4">
          {!notFound ? (
            <button
              type="button"
              onClick={() => void refetch()}
              className="text-sm font-bold font-satoshi text-[#135391] hover:underline"
            >
              {t("vendor.listings.detail.retry")}
            </button>
          ) : null}
          <Link
            href={backHref}
            className="text-sm font-bold font-satoshi text-[#135391] hover:underline"
          >
            {backLabel}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {backLink}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-bold font-satoshi text-[#2F2F2F]">
            {listing.title || t("vendor.listings.detail.heading")}
          </h2>
          <p className="mt-1 text-xs font-medium font-satoshi text-[#676565]">
            {t("vendor.listings.detail.hint")}
          </p>
          <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs font-medium font-satoshi text-[#676565]">
            <div className="flex gap-1">
              <dt>{t("vendor.listings.detail.status")}:</dt>
              <dd className="font-semibold text-[#2F2F2F]">
                {t(STATUS_LABEL_KEYS[listing.status])}
              </dd>
            </div>
            <div className="flex gap-1">
              <dt>{t("vendor.listings.detail.category")}:</dt>
              <dd className="font-semibold text-[#2F2F2F]">
                {t(VENDOR_CATEGORY_KEY[listing.category])}
              </dd>
            </div>
            <div className="flex gap-1">
              <dt>{t("vendor.listings.detail.rating")}:</dt>
              <dd className="font-semibold text-[#2F2F2F]">
                {listing.ratingCount > 0
                  ? `${listing.ratingAvg.toFixed(1)} (${listing.ratingCount})`
                  : "—"}
              </dd>
            </div>
          </dl>
        </div>

        <Link
          href={`/vendor/listings/${listing.id}/edit`}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#D85A30] px-4 text-sm font-bold font-satoshi text-white transition-opacity hover:opacity-90"
        >
          <Pencil className="h-4 w-4" />
          {t("vendor.dashboard.editListing")}
        </Link>
      </div>

      {listing.status === "rejected" ? (
        <div
          role="status"
          className="rounded-[5px] border border-[#DD2222]/30 bg-[#DD2222]/5 px-4 py-3 text-sm font-medium font-satoshi text-[#C0392B]"
        >
          {listing.rejectionReason
            ? t("vendor.addListing.rejectedNotice", {
                reason: listing.rejectionReason,
              })
            : t("vendor.addListing.rejectedNoticeNoReason")}
        </div>
      ) : null}

      <ReviewStepPage form={form} showIntro={false} />
    </div>
  );
}
