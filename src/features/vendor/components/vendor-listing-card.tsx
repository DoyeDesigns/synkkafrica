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
  // A pause/resume or delete for this listing is in flight.
  busy?: boolean;
};

const STATUS_LABEL_KEYS: Record<
  VendorDashboardListing["status"],
  TranslationKey
> = {
  live: "vendor.dashboard.status.live",
  pending: "vendor.dashboard.status.pending",
  paused: "vendor.dashboard.status.paused",
  draft: "vendor.dashboard.status.draft",
  rejected: "vendor.dashboard.status.rejected",
};

const STATUS_BADGE_STYLES: Record<VendorDashboardListing["status"], string> = {
  live: "bg-[#B9FF7C] text-[#446D14]",
  pending: "bg-[#D85A30]/12 text-[#D85A30]",
  paused: "bg-[#FFCE31]/25 text-[#9A7200]",
  draft: "bg-[#E5E5E5] text-[#5A5A5A]",
  rejected: "bg-[#DD2222]/12 text-[#C0392B]",
};

export function VendorListingCard({
  listing,
  variant = "dashboard",
  highlighted = false,
  onPauseToggle,
  onDeleteRequest,
  busy = false,
}: VendorListingCardProps) {
  const t = useTranslation();
  const isPending = listing.status === "pending";
  const isPaused = listing.status === "paused";
  const isRejected = listing.status === "rejected";
  const isListingsPage = variant === "listings";
  // Only a live/paused listing can be paused/resumed. Drafts (not submitted),
  // pending (awaiting review) and rejected listings can't.
  const isPauseDisabled =
    busy || (listing.status !== "live" && listing.status !== "paused");
  // Every status reopens in the wizard: drafts/rejected are (re)submitted,
  // live/paused/pending listings are saved in place.
  const editHref = `/vendor/listings/${listing.id}/edit`;

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
    : isPending || isRejected
      ? "border-[#DD2222]/45 bg-[#DD2222]/5"
      : isPaused
        ? "border-[#E6A817]/45 bg-[#FFCE31]/10"
        : "border-[#EEEEEE] bg-[#F5F5F5]";

  const titleClassName = isPending || isRejected
    ? "text-[#D75A5A]"
    : isPaused
      ? "text-[#B8860B]"
      : "text-[#004785]";

  const categoryClassName = isPending || isRejected
    ? "text-[#D75A5A]"
    : isPaused
      ? "text-[#B8860B]"
      : "text-[#676565]";

  return (
    <article
      id={`listing-${listing.id}`}
      className={`w-full min-w-0 max-w-full rounded-[5px] border p-3 sm:p-4 ${cardSurfaceClassName}`}
    >
      <div className="flex min-w-0 gap-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#ECEFF3] sm:h-20 sm:w-20">
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

        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:gap-3">
          <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
            <div className="min-w-0">
              <h3
                className={`truncate text-base font-bold font-satoshi ${titleClassName}`}
              >
                {listing.title}
              </h3>
              <p
                className={`mt-0.5 truncate text-sm font-medium font-satoshi ${categoryClassName}`}
              >
                {t(listing.categoryKey)}
              </p>
              {isRejected && listing.rejectionReason ? (
                <p className="mt-1 line-clamp-2 text-xs font-medium font-satoshi text-[#C0392B]">
                  {t("vendor.listings.rejectionNote", {
                    reason: listing.rejectionReason,
                  })}
                </p>
              ) : null}
            </div>

            <div className="flex items-center gap-0.5">
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

          <div className="flex flex-wrap items-center justify-between gap-2 sm:shrink-0 sm:flex-col sm:items-end sm:justify-between">
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
                disabled={busy || !onDeleteRequest}
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
                disabled={isPauseDisabled || !onPauseToggle}
                aria-busy={busy}
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

// Inline banner for a failed pause/resume/delete (the app has no toast system;
// errors are shown in place, like the wizard's publish error).
export function VendorListingActionError({
  message,
  onDismiss,
}: {
  message: string | null;
  onDismiss: () => void;
}) {
  const t = useTranslation();
  if (!message) return null;
  return (
    <div
      role="alert"
      className="flex items-start justify-between gap-3 rounded-[5px] border border-[#DD2222]/30 bg-[#DD2222]/5 px-4 py-3 text-sm font-medium font-satoshi text-[#C0392B]"
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 font-bold hover:underline"
      >
        {t("vendor.listings.dismiss")}
      </button>
    </div>
  );
}
