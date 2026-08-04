"use client";

import Image from "next/image";

import type { AdminListing } from "@/features/admin/data/admin-listings";
import { useTranslation } from "@/hooks/use-translation";

type AdminListingDetailModalProps = {
  listing: AdminListing;
  onClose: () => void;
};

export function AdminListingDetailModal({
  listing,
  onClose,
}: AdminListingDetailModalProps) {
  const t = useTranslation();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-listing-detail-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-[#EEEEEE] bg-white shadow-xl"
      >
        <div className="relative aspect-video w-full bg-[#F5F5F5]">
          <Image
            src={listing.image}
            alt={listing.name}
            fill
            className="object-cover"
          />
        </div>

        <div className="space-y-4 p-5 sm:p-6">
          <h2
            id="admin-listing-detail-title"
            className="text-xl font-bold font-satoshi text-[#2F2F2F]"
          >
            {listing.name}
          </h2>

          <dl className="grid gap-3 text-sm font-satoshi">
            <div className="flex justify-between gap-4">
              <dt className="font-medium text-[#676565]">
                {t("admin.listings.location")}
              </dt>
              <dd className="font-semibold text-[#2F2F2F]">{listing.location}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="font-medium text-[#676565]">
                {t("admin.listings.vendor")}
              </dt>
              <dd className="font-semibold text-[#2F2F2F]">{listing.vendorName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="font-medium text-[#676565]">
                {t("admin.listings.bookings")}
              </dt>
              <dd className="font-semibold text-[#2F2F2F]">{listing.bookings}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="font-medium text-[#676565]">
                {t("admin.listings.ratings")}
              </dt>
              <dd className="font-semibold text-[#D85A30]">
                {listing.rating} ({listing.reviewCount} {t("admin.listings.reviews")})
              </dd>
            </div>
            {listing.deletedAt ? (
              <div className="flex justify-between gap-4">
                <dt className="font-medium text-[#676565]">
                  {t("admin.listings.status.deleted")}
                </dt>
                <dd className="font-semibold text-[#676565]">
                  {t("admin.listings.deletedAt", {
                    date: new Intl.DateTimeFormat("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }).format(new Date(listing.deletedAt)),
                  })}
                </dd>
              </div>
            ) : null}
          </dl>

          <button
            type="button"
            onClick={onClose}
            className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-lg border border-[#E5E5E5] text-sm font-bold font-satoshi text-[#2F2F2F] hover:bg-[#FAFAFA]"
          >
            {t("admin.listings.detailClose")}
          </button>
        </div>
      </div>
    </div>
  );
}
