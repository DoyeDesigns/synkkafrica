"use client";

import { Pause, Pencil, Star, Trash2 } from "lucide-react";
import Image from "next/image";

import type { VendorDashboardListing } from "@/features/vendor/data/vendor-dashboard";
import { useTranslation } from "@/hooks/use-translation";

type VendorListingCardProps = {
  listing: VendorDashboardListing;
  variant?: "dashboard" | "listings";
};

export function VendorListingCard({
  listing,
  variant = "dashboard",
}: VendorListingCardProps) {
  const t = useTranslation();
  const isPending = listing.status === "pending";
  const isListingsPage = variant === "listings";

  const pendingLabel = isListingsPage
    ? t("vendor.listings.status.pendingApproval")
    : t("vendor.dashboard.status.pending");

  return (
    <article
      className={`rounded-[5px] border p-4 ${
        isPending
          ? "border-[#DD2222]/45 bg-[#DD2222]/5"
          : isListingsPage
            ? "border-[#EEEEEE] bg-[#F5F5F5]"
            : "border-[#EEEEEE] bg-[#F5F5F5]"
      }`}
    >
      <div className="flex gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
          <Image
            src={listing.image}
            alt={listing.title}
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>

        <div className="flex min-w-0 flex-1 gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-col justify-between items-start h-full">
            <div>
            <h3
              className={`truncate text-base font-bold font-satoshi ${
                isPending ? "text-[#D75A5A]" : "text-[#004785]"
              }`}
            >
              {listing.title}
            </h3>
            <p
              className={`mt-0.5 text-sm font-medium font-satoshi ${
                isPending ? "text-[#D75A5A]" : "text-[#676565]"
              }`}
            >
              {t(listing.categoryKey)}
            </p>
            </div>

            <div>
            {!isPending ? (
              <div className="mb-1.5 flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={`h-3.5 w-3.5 ${
                      index < listing.rating
                        ? "fill-[#FFCE31] text-[#FFCE31]"
                        : "fill-zinc-200 text-zinc-200"
                    }`}
                  />
                ))}
              </div>
            ) : null}
            </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-end justify-between gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold font-satoshi ${
                isPending
                  ? "bg-[#D85A30]/12 text-[#D85A30]"
                  : "bg-[#B9FF7C] text-[#446D14]"
              }`}
            >
              {isPending
                ? pendingLabel
                : t("vendor.dashboard.status.live")}
            </span>

            {!isPending ? (
              <div className="flex gap-1">
                <button
                  type="button"
                  aria-label={t("vendor.dashboard.editListing")}
                  className="rounded-md p-1.5 text-[#1E1E1E] transition-colors hover:bg-white/80"
                >
                  <Pencil className="h-4 w-4" fill="#1E1E1E" stroke="#F5F5F5" strokeWidth={1} />
                </button>
                <button
                  type="button"
                  aria-label={t("vendor.dashboard.deleteListing")}
                  className="rounded-md p-1.5 text-[#1E1E1E] transition-colors hover:bg-white/80"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                </button>
                <button
                  type="button"
                  aria-label={t("vendor.dashboard.pauseListing")}
                  className="rounded-md p-1.5 text-[#676565] transition-colors hover:bg-white/80"
                >
                  <Pause className="h-4 w-4" fill="#1E1E1E" strokeWidth={1} />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
