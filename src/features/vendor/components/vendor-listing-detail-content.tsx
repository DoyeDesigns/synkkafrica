"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { ReviewStepPage } from "@/features/vendor/components/vendor-add-listing-review-step";
import { formStateFromListingDetails } from "@/features/vendor/data/vendor-add-listing";
import { getVendorListingDetailForm } from "@/features/vendor/data/vendor-listing-detail";
import { useTranslation } from "@/hooks/use-translation";
import { getVendorListing } from "@/lib/api/vendor";

type VendorListingDetailContentProps = {
  listingId: string;
};

export function VendorListingDetailContent({
  listingId,
}: VendorListingDetailContentProps) {
  const t = useTranslation();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const token = session?.accessToken;
  const fromBookings = searchParams.get("from") === "bookings";
  const backHref = fromBookings ? "/vendor/bookings" : "/vendor/listings";
  const backLabel = fromBookings
    ? t("vendor.listings.detail.backToBookings")
    : t("vendor.listings.detail.back");

  const staticForm = getVendorListingDetailForm(listingId);
  const canFetch = Boolean(token && listingId);

  const { data: listing, isPending } = useQuery({
    queryKey: ["vendor-listing", listingId],
    queryFn: () => getVendorListing(token as string, listingId),
    enabled: canFetch,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const form = listing
    ? formStateFromListingDetails(
        listing.category,
        listing.details,
        listing.media,
        listing.coverImageUrl,
      )
    : staticForm;

  const waiting =
    !form && (status === "loading" || (canFetch && isPending));

  if (!form) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-[#EEEEEE] bg-white p-8 text-center shadow-sm">
        {waiting ? (
          <p className="flex items-center justify-center gap-2 text-sm font-medium font-satoshi text-[#676565]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </p>
        ) : (
          <p className="text-sm font-medium font-satoshi text-[#676565]">
            {t("vendor.listings.detail.notFound")}
          </p>
        )}
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm font-bold font-satoshi text-[#135391] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-sm font-medium font-satoshi text-[#135391] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Link>

      <div>
        <h2 className="text-base font-bold font-satoshi text-[#2F2F2F]">
          {t("vendor.listings.detail.heading")}
        </h2>
        <p className="mt-1 text-xs font-medium font-satoshi text-[#676565]">
          {t("vendor.listings.detail.hint")}
        </p>
      </div>

      <ReviewStepPage form={form} showIntro={false} />
    </div>
  );
}
