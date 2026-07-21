"use client";

import Link from "next/link";
import { CircleX, MapPin, Star } from "lucide-react";
import Image from "next/image";

import { BookingCountdownBadge } from "@/features/account/components/booking-countdown-badge";
import {
  canCancelBooking,
  getBookingListTab,
  type AccountBooking,
} from "@/features/account/data/account-bookings";
import { DisplayPrice } from "@/components/display-price";
import { useTranslation } from "@/hooks/use-translation";

type BookingOrderCardProps = {
  booking: AccountBooking;
  onCancel?: (bookingId: string) => void;
  onLeaveReview?: (bookingId: string) => void;
};

export function BookingOrderCard({
  booking,
  onCancel,
  onLeaveReview,
}: BookingOrderCardProps) {
  const t = useTranslation();
  const fullStars = Math.floor(booking.rating);
  const tab = getBookingListTab(booking);
  const isUpcoming = tab === "upcoming";
  const isPast = tab === "past";
  const isCancelled = tab === "cancelled";
  const cancellable = canCancelBooking(booking);

  return (
    <article className="overflow-hidden rounded-2xl border border-[#E8E8E8] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DEDEDE] px-5 py-3 sm:px-6">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold font-satoshi uppercase tracking-wide ${
            isUpcoming
              ? "bg-[#E8F3FF] text-[#004785]"
              : isPast
                ? "bg-[#F3F3F3] text-[#676565]"
                : "bg-[#FDEBEB] text-[#C0392B]"
          }`}
        >
          {isUpcoming
            ? t("account.bookings.badge.upcoming")
            : isPast
              ? t("account.bookings.badge.past")
              : t("account.bookings.badge.cancelled")}
        </span>

        {isUpcoming ? <BookingCountdownBadge booking={booking} /> : null}
      </div>

      <div className="grid gap-4 border-b border-[#DEDEDE] px-5 py-4 sm:grid-cols-2 lg:grid-cols-4 sm:px-6">
        <div>
          <p className="text-xs font-medium font-inter text-[#888686]">
            {t("account.bookings.orderDate")}
          </p>
          <p className="mt-1 text-base font-bold font-satoshi text-foreground">
            {booking.orderDate}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium font-inter text-foreground/55">
            {t("account.bookings.experienceDate")}
          </p>
          <p className="mt-1 text-base font-bold font-satoshi text-foreground">
            {booking.experienceDate}
            {booking.experienceTime ? ` · ${booking.experienceTime}` : ""}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium font-inter text-foreground/55">
            {t("account.bookings.totalAmount")}
          </p>
          <p className="mt-1 text-base font-bold font-satoshi text-foreground">
            <DisplayPrice currency={booking.currency} amount={booking.totalAmount} />
          </p>
        </div>

        <div>
          <p className="text-xs font-medium font-inter text-foreground/55">
            {t("account.bookings.orderNumber")}
          </p>
          <p className="mt-1 text-base font-bold font-satoshi text-foreground">
            {booking.orderNumber}
          </p>
        </div>
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-[140px_minmax(0,1fr)_220px] lg:items-start">
        <div className="relative aspect-square w-full max-w-[140px] overflow-hidden rounded-xl bg-zinc-100">
          <Image
            src={booking.image}
            alt={booking.title}
            fill
            className="object-cover"
            sizes="140px"
          />
        </div>

        <div className="min-w-0 space-y-2">
          <h2 className="text-sm font-bold font-montserrat text-foreground">
            {booking.title}
          </h2>
          <p className="text-sm font-base font-satoshi text-foreground">
            {booking.description}
          </p>
          <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:gap-5">
            <p className="inline-flex items-center gap-1.5 text-sm font-satoshi text-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1} />
              {booking.location}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={`h-3.5 w-3.5 ${
                      index < fullStars
                        ? "fill-amber-400 text-amber-400"
                        : "fill-zinc-200 text-zinc-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium font-satoshi text-[#D85A30]">
                {booking.rating} | {booking.reviewCount} Reviews
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 lg:items-end">
          <Link
            href={`/account/bookings/${booking.id}`}
            className="inline-flex h-11 items-center rounded-lg border border-[#D85A30] px-4 text-sm font-medium font-satoshi text-[#D85A30] transition-colors hover:bg-[#FFF1EB]"
          >
            {t("account.bookings.viewDetails")}
          </Link>

          {isUpcoming && cancellable ? (
            <button
              type="button"
              onClick={() => onCancel?.(booking.id)}
              className="inline-flex h-11 items-center gap-1.5 rounded-lg border border-[#FFE6DE] px-3 py-1.5 text-sm font-medium font-satoshi text-[#E53935] transition-colors hover:bg-[#FFF5F5]"
            >
              <CircleX className="h-4 w-4" fill="#D85A30" stroke="#FFFFFF" strokeWidth={2} />
              {t("account.bookings.cancel")}
            </button>
          ) : null}

          {isUpcoming && !cancellable ? (
            <p className="text-xs font-medium font-satoshi text-foreground/60 lg:text-right">
              {t("account.bookings.cancelWindowClosed")}
            </p>
          ) : null}

          {isPast && !booking.reviewSubmitted ? (
            <button
              type="button"
              onClick={() => onLeaveReview?.(booking.id)}
              className="inline-flex h-11 items-center rounded-lg bg-[#004785] px-4 text-sm font-medium font-satoshi text-white transition-opacity hover:opacity-90"
            >
              {t("account.bookings.leaveReview")}
            </button>
          ) : null}

          {isPast && booking.reviewSubmitted && booking.userReview ? (
            <p className="text-xs font-medium font-satoshi text-[#004785] lg:text-right">
              {t("account.bookings.reviewSubmitted")}
            </p>
          ) : null}

          {!isCancelled ? (
            <div className="lg:text-right">
              <p className="text-xs font-medium font-inter text-[#888686]">
                {t("account.bookings.receiptRecipient")}
              </p>
              <p className="mt-1 text-base font-bold font-satoshi text-foreground">
                {booking.recipientEmail}
              </p>
            </div>
          ) : null}

          {isCancelled && booking.cancelledAt ? (
            <p className="text-xs font-medium font-satoshi text-[#C0392B] lg:text-right">
              {t("account.bookings.cancelledOn", { date: booking.cancelledAt })}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
