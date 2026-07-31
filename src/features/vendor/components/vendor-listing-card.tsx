"use client";

import {
  BedDouble,
  Car,
  MapPin,
  Pause,
  Pencil,
  Play,
  Star,
  Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { VendorDashboardListing } from "@/features/vendor/data/vendor-dashboard";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

// Icon shown when a listing has no uploaded cover photo yet, keyed by the
// category translation key. Beats cropping a wide hero banner into a square
// thumbnail (which reads as a random unrelated photo).
const CATEGORY_PLACEHOLDER_ICON: Record<
  VendorDashboardListing["categoryKey"],
  LucideIcon
> = {
  "vendor.dashboard.category.accommodations": BedDouble,
  "vendor.dashboard.category.carRentals": Car,
  "vendor.dashboard.category.tours": MapPin,
  "vendor.dashboard.category.toursExperiences": MapPin,
};

type VendorListingCardProps = {
  listing: VendorDashboardListing;
  variant?: "dashboard" | "listings";
  highlighted?: boolean;
  onPauseToggle?: (listingId: string) => void;
  onDeleteRequest?: (listingId: string) => void;
};

const STATUS_LABEL_KEYS: Record<
  VendorDashboardListing["status"],
  TranslationKey
> = {
  live: "vendor.dashboard.status.live",
  pending: "vendor.dashboard.status.pending",
  paused: "vendor.dashboard.status.paused",
  draft: "vendor.dashboard.status.draft",
};

const STATUS_BADGE_STYLES: Record<VendorDashboardListing["status"], string> = {
  live: "bg-[#B9FF7C] text-[#446D14]",
  pending: "bg-[#D85A30]/12 text-[#D85A30]",
  paused: "bg-[#FFCE31]/25 text-[#9A7200]",
  draft: "bg-[#E5E5E5] text-[#5A5A5A]",
};

export function VendorListingCard({
  listing,
  variant = "dashboard",
  highlighted = false,
  onPauseToggle,
  onDeleteRequest,
}: VendorListingCardProps) {
  const t = useTranslation();
  const isPending = listing.status === "pending";
  const isPaused = listing.status === "paused";
  const isDraft = listing.status === "draft";
  const isListingsPage = variant === "listings";
  // Only a live/paused listing can be paused/resumed. Drafts (not submitted)
  // and pending (awaiting review) listings can't.
  const isPauseDisabled = isPending || isDraft;
  // A draft reopens in the wizard to continue editing; other statuses just
  // highlight the card on the listings page (in-place edit isn't wired yet).
  const editHref = isDraft
    ? `/vendor/listings/${listing.id}/edit`
    : `/vendor/listings?listing=${listing.id}`;

  const pendingLabel = isListingsPage
    ? t("vendor.listings.status.pendingApproval")
    : t("vendor.dashboard.status.pending");

  const pausedLabel = isListingsPage
    ? t("vendor.listings.status.paused")
    : t("vendor.dashboard.status.paused");

  const statusLabel =
    listing.status === "pending"
      ? pendingLabel
      : listing.status === "paused"
        ? pausedLabel
        : t(STATUS_LABEL_KEYS[listing.status]);

  const actionButtonClassName =
    "rounded-md p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-40";

  const cardSurfaceClassName = highlighted
    ? "border-[#135391] ring-2 ring-[#135391]/20"
    : isPending
      ? "border-[#DD2222]/45 bg-[#DD2222]/5"
      : isPaused
        ? "border-[#E6A817]/45 bg-[#FFCE31]/10"
        : "border-[#EEEEEE] bg-[#F5F5F5]";

  const titleClassName = isPending
    ? "text-[#D75A5A]"
    : isPaused
      ? "text-[#B8860B]"
      : "text-[#004785]";

  const categoryClassName = isPending
    ? "text-[#D75A5A]"
    : isPaused
      ? "text-[#B8860B]"
      : "text-[#676565]";

  return (
    <article
      id={`listing-${listing.id}`}
      className={`rounded-[5px] border p-4 ${cardSurfaceClassName}`}
    >
      <div className="flex gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-[#ECEFF3]">
          {listing.image ? (
            <Image
              src={listing.image}
              alt={listing.title}
              fill
              className="object-cover"
              sizes="80px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              {(() => {
                const PlaceholderIcon =
                  CATEGORY_PLACEHOLDER_ICON[listing.categoryKey];
                return (
                  <PlaceholderIcon
                    className="h-7 w-7 text-[#9AA6B2]"
                    strokeWidth={1.75}
                  />
                );
              })()}
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex h-full flex-col items-start justify-between">
              <div>
                <h3
                  className={`truncate text-base font-bold font-satoshi ${titleClassName}`}
                >
                  {listing.title}
                </h3>
                <p
                  className={`mt-0.5 text-sm font-medium font-satoshi ${categoryClassName}`}
                >
                  {t(listing.categoryKey)}
                </p>
              </div>

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
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-end justify-between gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold font-satoshi ${STATUS_BADGE_STYLES[listing.status]}`}
            >
              {statusLabel}
            </span>

            <div className="flex gap-1">
              <Link
                href={editHref}
                aria-label={t("vendor.dashboard.editListing")}
                className={`${actionButtonClassName} text-[#1E1E1E] hover:bg-white/80`}
              >
                <Pencil
                  className="h-4 w-4"
                  fill="#1E1E1E"
                  stroke="#F5F5F5"
                  strokeWidth={1}
                />
              </Link>
              <button
                type="button"
                aria-label={t("vendor.dashboard.deleteListing")}
                onClick={() => onDeleteRequest?.(listing.id)}
                className={`${actionButtonClassName} text-[#1E1E1E] hover:bg-white/80`}
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                aria-label={
                  isPaused
                    ? t("vendor.dashboard.playListing")
                    : t("vendor.dashboard.pauseListing")
                }
                disabled={isPauseDisabled}
                onClick={() => onPauseToggle?.(listing.id)}
                className={`${actionButtonClassName} text-[#676565] hover:bg-white/80`}
              >
                {isPaused ? (
                  <Play className="h-4 w-4 fill-[#1E1E1E]" strokeWidth={1} />
                ) : (
                  <Pause className="h-4 w-4 fill-[#1E1E1E]" strokeWidth={1} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
