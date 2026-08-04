"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { getAdminListingDetailForm } from "@/features/admin/data/admin-listing-detail";
import type { AdminListing, AdminListingKind } from "@/features/admin/data/admin-listings";
import { ReviewStepPage } from "@/features/vendor/components/vendor-add-listing-review-step";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

const BACK_HREF: Record<AdminListingKind, string> = {
  cars: "/admin/cars",
  accommodations: "/admin/accommodations",
  experiences: "/admin/experiences",
};

const BACK_LABEL_KEYS: Record<AdminListingKind, TranslationKey> = {
  cars: "admin.listings.detail.backCars",
  accommodations: "admin.listings.detail.backAccommodations",
  experiences: "admin.listings.detail.backExperiences",
};

const STATUS_LABEL_KEYS = {
  active: "admin.listings.status.active",
  inactive: "admin.listings.status.inactive",
  deleted: "admin.listings.status.deleted",
} as const;

const STATUS_BADGE_STYLES = {
  active: "bg-[#E8F5E9] text-[#2E7D32]",
  inactive: "bg-[#F5F5F5] text-[#676565]",
  deleted: "bg-[#FFEBEE] text-[#C62828]",
} as const;

type AdminListingDetailContentProps = {
  kind: AdminListingKind;
  listing: AdminListing;
};

export function AdminListingDetailContent({
  kind,
  listing,
}: AdminListingDetailContentProps) {
  const t = useTranslation();
  const form = getAdminListingDetailForm(listing, kind);

  return (
    <div className="space-y-6">
      <Link
        href={BACK_HREF[kind]}
        className="inline-flex items-center gap-2 text-sm font-medium font-satoshi text-[#135391] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        {t(BACK_LABEL_KEYS[kind])}
      </Link>

      <div className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-bold font-satoshi text-[#2F2F2F]">
              {listing.name}
            </h2>
            <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
              {listing.location} · {listing.vendorName}
            </p>
          </div>
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_BADGE_STYLES[listing.status]}`}
          >
            {t(STATUS_LABEL_KEYS[listing.status])}
          </span>
        </div>

        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-[#FAFAFA] px-3 py-2.5">
            <dt className="text-xs font-medium font-satoshi text-[#676565]">
              {t("admin.listings.bookings")}
            </dt>
            <dd className="mt-1 text-sm font-bold font-satoshi text-[#2F2F2F]">
              {listing.bookings}
            </dd>
          </div>
          <div className="rounded-lg bg-[#FAFAFA] px-3 py-2.5">
            <dt className="text-xs font-medium font-satoshi text-[#676565]">
              {t("admin.listings.ratings")}
            </dt>
            <dd className="mt-1 text-sm font-bold font-satoshi text-[#D85A30]">
              {listing.rating} ({listing.reviewCount} {t("admin.listings.reviews")})
            </dd>
          </div>
          <div className="rounded-lg bg-[#FAFAFA] px-3 py-2.5">
            <dt className="text-xs font-medium font-satoshi text-[#676565]">
              {t("admin.listings.vendor")}
            </dt>
            <dd className="mt-1 text-sm font-bold font-satoshi text-[#2F2F2F]">
              {listing.vendorName}
            </dd>
          </div>
        </dl>
      </div>

      <div>
        <h3 className="text-base font-bold font-satoshi text-[#2F2F2F]">
          {t("admin.listings.detailTitle")}
        </h3>
        <p className="mt-1 text-xs font-medium font-satoshi text-[#676565]">
          {t("admin.listings.detailHint")}
        </p>
      </div>

      <ReviewStepPage form={form} showIntro={false} />
    </div>
  );
}

type AdminListingDetailNotFoundProps = {
  kind: AdminListingKind;
};

export function AdminListingDetailNotFound({ kind }: AdminListingDetailNotFoundProps) {
  const t = useTranslation();

  return (
    <div className="rounded-xl border border-[#EEEEEE] bg-white p-8 text-center shadow-sm">
      <p className="text-sm font-medium font-satoshi text-[#676565]">
        {t("admin.listings.detailNotFound")}
      </p>
      <Link
        href={BACK_HREF[kind]}
        className="mt-4 inline-flex text-sm font-bold font-satoshi text-[#135391] hover:underline"
      >
        {t(BACK_LABEL_KEYS[kind])}
      </Link>
    </div>
  );
}
