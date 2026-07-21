"use client";

import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";

import { AccountBookingReviewModal } from "@/features/account/components/account-booking-review-modal";
import { BookingOrderCard } from "@/features/account/components/booking-order-card";
import {
  BOOKING_PERIOD_OPTIONS,
  type BookingListTab,
} from "@/features/account/data/account-bookings";
import { useAccountBookings } from "@/features/account/hooks/use-account-bookings";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

const INITIAL_VISIBLE_COUNT = 3;
const LOAD_MORE_COUNT = 2;

const TAB_KEYS: Record<BookingListTab, TranslationKey> = {
  upcoming: "account.bookings.tab.upcoming",
  past: "account.bookings.tab.past",
  cancelled: "account.bookings.tab.cancelled",
};

type AccountBookingsContentProps = {
  userId: string;
  userEmail: string;
  authorName: string;
};

export function AccountBookingsContent({
  userId,
  userEmail,
  authorName,
}: AccountBookingsContentProps) {
  const t = useTranslation();
  const [activeTab, setActiveTab] = useState<BookingListTab>("upcoming");
  const [period, setPeriod] = useState<string>(BOOKING_PERIOD_OPTIONS[0]);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null);
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);

  const { ready, counts, getBookingsByTab, cancelBooking, submitReview, getBookingById } =
    useAccountBookings(userId, userEmail, authorName);

  const filteredBookings = useMemo(
    () => getBookingsByTab(activeTab),
    [activeTab, getBookingsByTab],
  );

  const visibleBookings = filteredBookings.slice(0, visibleCount);
  const hasMore = visibleCount < filteredBookings.length;
  const reviewBooking = reviewBookingId ? getBookingById(reviewBookingId) : null;

  const handleTabChange = (tab: BookingListTab) => {
    setActiveTab(tab);
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  };

  const handleCancel = (bookingId: string) => {
    setCancelConfirmId(bookingId);
  };

  const confirmCancel = () => {
    if (!cancelConfirmId) {
      return;
    }

    cancelBooking(cancelConfirmId);
    setCancelConfirmId(null);
  };

  if (!ready) {
    return <div className="min-h-[320px] rounded-2xl bg-white" />;
  }

  return (
    <>
      <section className="rounded-2xl border border-[#EEEEEE] bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-lg font-bold font-montserrat text-foreground">
          {t("account.bookings.title")}
        </h1>

        <div className="mt-6 flex h-auto min-h-15 flex-col gap-4 border-b border-[#E8E8E8] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-6">
            {(["upcoming", "past", "cancelled"] as const).map((tabId) => {
              const isActive = activeTab === tabId;

              return (
                <button
                  key={tabId}
                  type="button"
                  onClick={() => handleTabChange(tabId)}
                  className={`pb-3 text-sm font-medium font-satoshi transition-colors ${
                    isActive
                      ? "border-b-2 border-foreground text-foreground"
                      : "text-foreground/55 hover:text-foreground"
                  }`}
                >
                  {t(TAB_KEYS[tabId])} ({counts[tabId]})
                </button>
              );
            })}
          </div>

          <label className="relative w-full sm:w-auto sm:min-w-[160px]">
            <span className="sr-only">{t("account.bookings.filterPeriod")}</span>
            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              className="h-10 w-full appearance-none rounded-[22px] border border-[#D0D0D0] bg-[#A2A2A2]/10 px-4 pr-9 text-sm font-medium font-satoshi text-foreground outline-none focus:border-[#D85A30]"
            >
              {BOOKING_PERIOD_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/60" />
          </label>
        </div>

        <div className="mt-6 space-y-4">
          {visibleBookings.length > 0 ? (
            visibleBookings.map((booking) => (
              <BookingOrderCard
                key={booking.id}
                booking={booking}
                onCancel={handleCancel}
                onLeaveReview={setReviewBookingId}
              />
            ))
          ) : (
            <div className="rounded-2xl border border-[#E8E8E8] bg-[#FAFAFA] px-6 py-10 text-center">
              <p className="text-sm font-medium font-satoshi text-foreground/70">
                {activeTab === "upcoming"
                  ? t("account.bookings.empty.upcoming")
                  : activeTab === "past"
                    ? t("account.bookings.empty.past")
                    : t("account.bookings.empty.cancelled")}
              </p>
            </div>
          )}
        </div>

        {hasMore ? (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() =>
                setVisibleCount((current) => current + LOAD_MORE_COUNT)
              }
              className="inline-flex items-center gap-2 rounded-lg border border-[#D85A30] px-8 py-3 text-sm font-medium font-satoshi text-[#D85A30] transition-colors hover:bg-[#FFF1EB]"
            >
              {t("common.seeMore")}
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </section>

      {cancelConfirmId ? (
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
                onClick={() => setCancelConfirmId(null)}
                className="rounded-md border border-[#E5E5E5] px-4 py-2 text-sm font-medium font-satoshi"
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                onClick={confirmCancel}
                className="rounded-md bg-[#E53935] px-4 py-2 text-sm font-bold font-montserrat text-white"
              >
                {t("account.bookings.confirmCancel")}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <AccountBookingReviewModal
        bookingTitle={reviewBooking?.title ?? ""}
        open={Boolean(reviewBooking)}
        onClose={() => setReviewBookingId(null)}
        onSubmit={(input) => {
          if (reviewBookingId) {
            submitReview(reviewBookingId, input);
          }
        }}
      />
    </>
  );
}
