"use client";

import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { useTranslation } from "@/hooks/use-translation";

export function VendorAddListingSuccessContent() {
  const t = useTranslation();

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F5E9]">
        <CheckCircle2 className="h-9 w-9 text-[#2E7D32]" strokeWidth={1.75} />
      </div>

      <h1 className="mt-6 text-2xl font-bold font-satoshi text-[#2F2F2F]">
        {t("vendor.addListing.success.title")}
      </h1>
      <p className="mt-3 text-sm font-medium font-satoshi leading-relaxed text-[#676565]">
        {t("vendor.addListing.success.message")}
      </p>

      <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/vendor/add-listing"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-[#D85A30] px-6 text-sm font-bold font-satoshi text-white transition-opacity hover:opacity-90"
        >
          {t("vendor.addListing.success.addAnother")}
        </Link>
        <Link
          href="/vendor/listings"
          className="inline-flex h-11 items-center justify-center rounded-lg border border-[#E5E5E5] bg-white px-6 text-sm font-bold font-satoshi text-[#2F2F2F] transition-colors hover:bg-[#FAFAFA]"
        >
          {t("vendor.addListing.success.backToListings")}
        </Link>
      </div>
    </div>
  );
}
