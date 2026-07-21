"use client";

import Link from "next/link";
import { ArrowLeft, CircleX, MapPin, Star } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

import { AccountBookingReviewModal } from "@/features/account/components/account-booking-review-modal";
import { BookingCountdownBadge } from "@/features/account/components/booking-countdown-badge";
import {
  canCancelBooking,
  getBookingListTab,
} from "@/features/account/data/account-bookings";
import { useAccountBookings } from "@/features/account/hooks/use-account-bookings";
import { DisplayPrice } from "@/components/display-price";
import { useTranslation } from "@/hooks/use-translation";

type AccountBookingDetailContentProps = {
  userId: string;
  userEmail: string;
  authorName: string;
  bookingId: string;
};

export function AccountBookingDetailContent({
  userId,
  userEmail,
  authorName,
  bookingId,
}: AccountBookingDetailContentProps) {
  const t = useTranslation();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const { ready, getBookingById, cancelBooking, submitReview } = useAccountBookings(
    userId,
    userEmail,
    authorName,
  );

  const booking = useMemo(
    () => (ready ? getBookingById(bookingId) : null),
    [ready, getBookingById, bookingId],
  );

  if (!ready) {
    return <div className="min-h-[420px] rounded-2xl bg-white" />;
  }

  if (!booking) {
    return (
      <section className="rounded-2xl border border-[#EEEEEE] bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-medium font-satoshi text-foreground/70">
          {t("account.bookings.detail.notFound")}
        </p>
        <Link
          href="/account/bookings"
          className="mt-4 inline-flex text-sm font-medium font-satoshi text-[#004785]"
        >
          {t("account.bookings.detail.back")}
        </Link>
      </section>
    );
  }

  const tab = getBookingListTab(booking);
  const isUpcoming = tab === "upcoming";
  const isPast = tab === "past";
  const cancellable = canCancelBooking(booking);

  return (
    <>
      <section className="rounded-2xl border border-[#EEEEEE] bg-white p-6 shadow-sm sm:p-8">
        <Link
          href="/account/bookings"
          className="inline-flex items-center gap-2 text-sm font-medium font-satoshi text-[#004785] transition-opacity hover:opacity-80"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("account.bookings.detail.back")}
        </Link>

        <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold font-satoshi uppercase tracking-wide text-[#676565]">
              {t("account.bookings.detail.reference")}
            </p>
            <h1 className="mt-1 text-2xl font-bold font-montserrat text-foreground">
              {booking.orderNumber}
            </h1>
          </div>

          {isUpcoming ? <BookingCountdownBadge booking={booking} variant="detail" /> : null}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-zinc-100 lg:aspect-square">
            <Image
              src={booking.image}
              alt={booking.title}
              fill
              className="object-cover"
              sizes="220px"
            />
          </div>

          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold font-montserrat text-foreground">
                {booking.title}
              </h2>
              <p className="mt-2 text-sm font-satoshi text-foreground/80">
                {booking.description}
              </p>
              <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-satoshi text-foreground">
                <MapPin className="h-4 w-4" />
                {booking.location}
              </p>
            </div>

            <dl className="grid gap-4 rounded-2xl border border-[#E8E8E8] bg-[#FAFAFA] p-5 sm:grid-cols-2">
              <DetailItem label={t("account.bookings.orderDate")} value={booking.orderDate} />
              <DetailItem
                label={t("account.bookings.experienceDate")}
                value={`${booking.experienceDate}${booking.experienceTime ? ` · ${booking.experienceTime}` : ""}`}
              />
              <DetailItem
                label={t("account.bookings.totalAmount")}
                value={<DisplayPrice currency={booking.currency} amount={booking.totalAmount} />}
              />
              <DetailItem
                label={t("account.bookings.guestCount")}
                value={String(booking.guestCount)}
              />
              <DetailItem
                label={t("account.bookings.receiptRecipient")}
                value={booking.recipientEmail}
              />
              {booking.specialRequests ? (
                <DetailItem
                  label={t("account.bookings.specialRequests")}
                  value={booking.specialRequests}
                  className="sm:col-span-2"
                />
              ) : null}
            </dl>

            {booking.userReview ? (
              <div className="rounded-2xl border border-[#E8F3FF] bg-[#F7FBFF] p-5">
                <p className="text-sm font-semibold font-satoshi text-[#004785]">
                  {t("account.bookings.detail.yourReview")}
                </p>
                <div className="mt-2 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={`h-4 w-4 ${
                        index < booking.userReview!.rating
                          ? "fill-amber-400 text-amber-400"
                          : "fill-zinc-200 text-zinc-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-2 text-sm font-satoshi text-foreground">
                  {booking.userReview.text}
                </p>
                {booking.userReview.photos && booking.userReview.photos.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {booking.userReview.photos.map((photo, index) => (
                      <div
                        key={`${booking.id}-review-photo-${index}`}
                        className="relative h-16 w-16 overflow-hidden rounded-lg border border-[#E5E5E5]"
                      >
                        <Image src={photo} alt="" fill className="object-cover" sizes="64px" />
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              {isUpcoming && cancellable ? (
                <button
                  type="button"
                  onClick={() => setShowCancelConfirm(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#FFE6DE] px-4 py-2.5 text-sm font-medium font-satoshi text-[#E53935]"
                >
                  <CircleX className="h-4 w-4" />
                  {t("account.bookings.cancel")}
                </button>
              ) : null}

              {isPast && !booking.reviewSubmitted ? (
                <button
                  type="button"
                  onClick={() => setShowReviewModal(true)}
                  className="rounded-lg bg-[#004785] px-4 py-2.5 text-sm font-medium font-satoshi text-white"
                >
                  {t("account.bookings.leaveReview")}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {showCancelConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold font-montserrat text-foreground">
              {t("account.bookings.cancelConfirmTitle")}
            </h2>
            <p className="mt-2 text-sm font-satoshi text-foreground/70">
              {t("account.bookings.cancelConfirmBody")}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                className="rounded-md border border-[#E5E5E5] px-4 py-2 text-sm font-medium font-satoshi"
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                onClick={() => {
                  cancelBooking(booking.id);
                  setShowCancelConfirm(false);
                }}
                className="rounded-md bg-[#E53935] px-4 py-2 text-sm font-bold font-montserrat text-white"
              >
                {t("account.bookings.confirmCancel")}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <AccountBookingReviewModal
        bookingTitle={booking.title}
        open={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmit={(input) => submitReview(booking.id, input)}
      />
    </>
  );
}

function DetailItem({
  label,
  value,
  className = "",
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-xs font-medium font-inter text-foreground/55">{label}</dt>
      <dd className="mt-1 text-sm font-bold font-satoshi text-foreground">{value}</dd>
    </div>
  );
}
