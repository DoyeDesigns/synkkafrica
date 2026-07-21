"use client";

import Image from "next/image";

import {
  formatExperienceDate,
  formatExperienceTime,
  type VendorBooking,
} from "@/features/vendor/data/vendor-bookings";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

const STATUS_LABEL_KEYS: Record<VendorBooking["status"], TranslationKey> = {
  awaiting_confirmation: "vendor.bookings.status.awaitingConfirmation",
  confirmed: "vendor.bookings.status.confirmed",
  declined: "vendor.bookings.status.declined",
  completed: "vendor.bookings.status.completed",
  cancelled: "vendor.bookings.status.cancelled",
};

const STATUS_BADGE_STYLES: Record<VendorBooking["status"], string> = {
  awaiting_confirmation: "bg-[#FFF3E0] text-[#E65100]",
  confirmed: "bg-[#E8F5E9] text-[#2E7D32]",
  declined: "bg-[#FDEBEB] text-[#C0392B]",
  completed: "bg-[#E8F5E9] text-[#2E7D32]",
  cancelled: "bg-[#FDEBEB] text-[#C0392B]",
};

type VendorBookingCardProps = {
  booking: VendorBooking;
  showActions?: boolean;
  onConfirm?: (bookingId: string) => void;
  onDecline?: (bookingId: string) => void;
  onComplete?: (bookingId: string) => void;
};

export function VendorBookingCard({
  booking,
  showActions = false,
  onConfirm,
  onDecline,
  onComplete,
}: VendorBookingCardProps) {
  const t = useTranslation();

  const canConfirmOrDecline = booking.status === "awaiting_confirmation";
  const canMarkComplete = booking.status === "confirmed";

  return (
    <article className="rounded-[5px] border border-[#EEEEEE] bg-[#F5F5F5] p-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative h-20 w-full shrink-0 overflow-hidden rounded-lg sm:h-20 sm:w-20">
          <Image
            src={booking.listingImage}
            alt={booking.listingTitle}
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className="truncate text-base font-bold font-satoshi text-[#004785]">
                {booking.listingTitle}
              </h3>
              <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
                {formatExperienceDate(booking.experienceDate)} ·{" "}
                {formatExperienceTime(booking.experienceTime)}
              </p>
            </div>

            <span
              className={`shrink-0 self-start rounded-full px-3 py-1 text-xs font-semibold font-satoshi ${STATUS_BADGE_STYLES[booking.status]}`}
            >
              {t(STATUS_LABEL_KEYS[booking.status])}
            </span>
          </div>

          <dl className="mt-4 grid gap-2 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold font-satoshi uppercase tracking-wide text-[#676565]">
                {t("booking.guest.firstName")}
              </dt>
              <dd className="mt-0.5 text-sm font-medium font-satoshi text-[#2F2F2F]">
                {booking.guestFirstName}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold font-satoshi uppercase tracking-wide text-[#676565]">
                {t("booking.table.guestCount")}
              </dt>
              <dd className="mt-0.5 text-sm font-medium font-satoshi text-[#2F2F2F]">
                {booking.guestCount}
              </dd>
            </div>
          </dl>

          {booking.specialRequests ? (
            <div className="mt-3 rounded-lg border border-[#E8E8E8] bg-white px-3 py-2.5">
              <p className="text-xs font-semibold font-satoshi uppercase tracking-wide text-[#676565]">
                {t("vendor.bookings.specialRequests")}
              </p>
              <p className="mt-1 text-sm font-medium font-satoshi text-[#2F2F2F]">
                {booking.specialRequests}
              </p>
            </div>
          ) : null}

          {showActions && (canConfirmOrDecline || canMarkComplete) ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {canConfirmOrDecline ? (
                <>
                  <button
                    type="button"
                    onClick={() => onConfirm?.(booking.id)}
                    className="rounded-lg bg-[#2E7D32] px-4 py-2 text-sm font-bold font-montserrat text-white transition-opacity hover:opacity-90"
                  >
                    {t("vendor.bookings.confirm")}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDecline?.(booking.id)}
                    className="rounded-lg border border-[#C0392B] bg-white px-4 py-2 text-sm font-bold font-montserrat text-[#C0392B] transition-colors hover:bg-[#FDEBEB]"
                  >
                    {t("vendor.bookings.decline")}
                  </button>
                </>
              ) : null}
              {canMarkComplete ? (
                <button
                  type="button"
                  onClick={() => onComplete?.(booking.id)}
                  className="rounded-lg bg-[#004785] px-4 py-2 text-sm font-bold font-montserrat text-white transition-opacity hover:opacity-90"
                >
                  {t("vendor.bookings.markComplete")}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
