"use client";

import { BadgeCheck, Clock3 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import {
  formatBookingDateTime,
  formatRespondWithin,
  getVendorListingHref,
  type VendorBooking,
} from "@/features/vendor/data/vendor-bookings";
import { useFormatPrice } from "@/hooks/use-format-price";
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
  onCancel?: (bookingId: string) => void;
};

export function VendorBookingCard({
  booking,
  showActions = false,
  onConfirm,
  onDecline,
  onCancel,
}: VendorBookingCardProps) {
  const t = useTranslation();
  const formatPrice = useFormatPrice();

  const canConfirmOrDecline = booking.status === "awaiting_confirmation";
  const canCancel = booking.status === "confirmed";
  const respondWithin = booking.respondBy
    ? formatRespondWithin(booking.respondBy)
    : null;
  const isCarBooking = booking.productType === "car";
  const carAddressLabel =
    booking.carRentalMode === "self_drive" && booking.deliveryAddress
      ? t("vendor.bookings.deliveryAddress")
      : t("vendor.bookings.pickupAddress");
  const carAddressValue =
    booking.carRentalMode === "self_drive" && booking.deliveryAddress
      ? booking.deliveryAddress
      : booking.pickupAddress;

  return (
    <article className="rounded-xl border border-[#EEEEEE] bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-1 gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg sm:h-20 sm:w-20">
            <Image
              src={booking.listingImage}
              alt={booking.listingTitle}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold font-satoshi uppercase tracking-wide text-[#676565]">
              {booking.bookingReference}
            </p>
            <h3 className="mt-1 truncate text-base font-bold font-satoshi text-[#135391] sm:text-lg">
              {booking.listingTitle}
            </h3>
            <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
              {formatBookingDateTime(booking.experienceDate, booking.experienceTime)}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-2 lg:items-end">
          {respondWithin && booking.status === "awaiting_confirmation" ? (
            <p className="flex items-center gap-1.5 text-xs font-semibold font-satoshi text-[#C0392B]">
              <Clock3 className="h-3.5 w-3.5" strokeWidth={2} />
              {t("vendor.bookings.respondWithin", { time: respondWithin })}
            </p>
          ) : null}

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold font-satoshi ${STATUS_BADGE_STYLES[booking.status]}`}
          >
            {t(STATUS_LABEL_KEYS[booking.status])}
          </span>

          <p className="text-lg font-bold font-satoshi text-[#2F2F2F]">
            {formatPrice(booking.currency, booking.amount)}
          </p>

          {booking.paymentSecured ? (
            <p className="flex items-center gap-1 text-xs font-semibold font-satoshi text-[#2E7D32]">
              <BadgeCheck className="h-3.5 w-3.5" strokeWidth={2} />
              {t("vendor.bookings.paymentSecured")}
            </p>
          ) : null}
        </div>
      </div>

      <dl className="mt-5 grid gap-4 border-t border-[#F0F0F0] pt-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold font-satoshi uppercase tracking-wide text-[#676565]">
            {t("booking.guest.firstName")}
          </dt>
          <dd className="mt-1 text-sm font-bold font-satoshi text-[#2F2F2F]">
            {booking.guestFirstName}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold font-satoshi uppercase tracking-wide text-[#676565]">
            {t("booking.table.guestCount")}
          </dt>
          <dd className="mt-1 text-sm font-bold font-satoshi text-[#2F2F2F]">
            {booking.guestCount}
          </dd>
        </div>
      </dl>

      {isCarBooking && carAddressValue ? (
        <div className="mt-4 rounded-lg bg-[#F0F6FC] px-4 py-3">
          <p className="text-xs font-semibold font-satoshi uppercase tracking-wide text-[#676565]">
            {carAddressLabel}
          </p>
          <p className="mt-1 text-sm font-medium font-satoshi text-[#2F2F2F]">
            {carAddressValue}
          </p>
          {booking.carRentalMode ? (
            <p className="mt-2 text-xs font-semibold font-satoshi text-[#135391]">
              {booking.carRentalMode === "self_drive"
                ? t("vendor.bookings.carMode.selfDrive")
                : t("vendor.bookings.carMode.withDriver")}
            </p>
          ) : null}
        </div>
      ) : null}

      {!isCarBooking && booking.specialRequests ? (
        <div className="mt-4 rounded-lg bg-[#F0F6FC] px-4 py-3">
          <p className="text-xs font-semibold font-satoshi uppercase tracking-wide text-[#676565]">
            {t("vendor.bookings.specialRequests")}
          </p>
          <p className="mt-1 text-sm font-medium font-satoshi text-[#2F2F2F]">
            {booking.specialRequests}
          </p>
        </div>
      ) : null}

      {booking.declineReason ? (
        <div className="mt-4 rounded-lg border border-[#F5C6CB] bg-[#FDEBEB] px-4 py-3">
          <p className="text-xs font-semibold font-satoshi uppercase tracking-wide text-[#C0392B]">
            {t("vendor.bookings.declineReason")}
          </p>
          <p className="mt-1 text-sm font-medium font-satoshi text-[#C0392B]">
            {booking.declineReason}
          </p>
        </div>
      ) : null}

      {showActions && (canConfirmOrDecline || canCancel) ? (
        <div className="mt-5 flex flex-wrap gap-2 border-t border-[#F0F0F0] pt-4">
          {canConfirmOrDecline ? (
            <>
              <button
                type="button"
                onClick={() => onConfirm?.(booking.id)}
                className="rounded-lg bg-[#2E7D32] px-4 py-2.5 text-sm font-bold font-satoshi text-white transition-opacity hover:opacity-90"
              >
                {t("vendor.bookings.confirm")}
              </button>
              <button
                type="button"
                onClick={() => onDecline?.(booking.id)}
                className="rounded-lg border border-[#C0392B] bg-white px-4 py-2.5 text-sm font-bold font-satoshi text-[#C0392B] transition-colors hover:bg-[#FDEBEB]"
              >
                {t("vendor.bookings.decline")}
              </button>
            </>
          ) : null}

          {canCancel ? (
            <button
              type="button"
              onClick={() => onCancel?.(booking.id)}
              className="rounded-lg border border-[#C0392B] bg-white px-4 py-2.5 text-sm font-bold font-satoshi text-[#C0392B] transition-colors hover:bg-[#FDEBEB]"
            >
              {t("vendor.bookings.cancelBooking")}
            </button>
          ) : null}

          <Link
            href={getVendorListingHref(booking.listingId, { from: "bookings" })}
            className="rounded-lg border border-[#E5E5E5] bg-white px-4 py-2.5 text-sm font-bold font-satoshi text-[#2F2F2F] transition-colors hover:bg-[#FAFAFA]"
          >
            {t("vendor.bookings.viewListing")}
          </Link>
        </div>
      ) : null}
    </article>
  );
}
