"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { ReviewStepPage } from "@/features/vendor/components/vendor-add-listing-review-step";
import { getVendorListingDetailForm } from "@/features/vendor/data/vendor-listing-detail";
import { useTranslation } from "@/hooks/use-translation";

type VendorListingDetailContentProps = {
  listingId: string;
};

export function VendorListingDetailContent({
  listingId,
}: VendorListingDetailContentProps) {
  const t = useTranslation();
  const searchParams = useSearchParams();
  const fromBookings = searchParams.get("from") === "bookings";
  const backHref = fromBookings ? "/vendor/bookings" : "/vendor/listings";
  const backLabel = fromBookings
    ? t("vendor.listings.detail.backToBookings")
    : t("vendor.listings.detail.back");
  const form = getVendorListingDetailForm(listingId);

  if (!form) {
    return (
      <div className="rounded-xl border border-[#EEEEEE] bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-medium font-satoshi text-[#676565]">
          {t("vendor.listings.detail.notFound")}
        </p>
        <Link
          href={backHref}
          className="mt-4 inline-flex text-sm font-bold font-satoshi text-[#135391] hover:underline"
        >
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
