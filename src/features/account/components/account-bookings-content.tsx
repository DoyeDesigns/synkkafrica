"use client";

import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";

import { BookingOrderCard } from "@/features/account/components/booking-order-card";
import {
  ACCOUNT_BOOKINGS,
  BOOKING_PERIOD_OPTIONS,
  type BookingTab,
} from "@/features/account/data/account-bookings";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

const INITIAL_VISIBLE_COUNT = 2;
const LOAD_MORE_COUNT = 2;

const TAB_KEYS: Record<BookingTab, TranslationKey> = {
  bookings: "account.bookings.tab.bookings",
  cancelled: "account.bookings.tab.cancelled",
};

export function AccountBookingsContent() {
  const t = useTranslation();
  const [activeTab, setActiveTab] = useState<BookingTab>("bookings");
  const [period, setPeriod] = useState<string>(BOOKING_PERIOD_OPTIONS[0]);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  const filteredBookings = useMemo(
    () => ACCOUNT_BOOKINGS.filter((booking) => booking.status === activeTab),
    [activeTab],
  );

  const visibleBookings = filteredBookings.slice(0, visibleCount);
  const hasMore = visibleCount < filteredBookings.length;

  const handleTabChange = (tab: BookingTab) => {
    setActiveTab(tab);
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  };

  return (
    <section className="rounded-2xl border border-[#EEEEEE] bg-white p-6 shadow-sm sm:p-8">
      <h1 className="text-lg font-bold font-montserrat text-foreground">
        {t("account.bookings.title")}
      </h1>

      <div className="mt-6 h-15 flex flex-col gap-4 border-b border-[#E8E8E8] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-6">
          {(["bookings", "cancelled"] as const).map((tabId) => {
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
                {t(TAB_KEYS[tabId])}
              </button>
            );
          })}
        </div>

        <label className="relative w-full sm:w-auto sm:min-w-[160px]">
          <span className="sr-only">Filter by period</span>
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
            <BookingOrderCard key={booking.id} booking={booking} />
          ))
        ) : (
          <div className="rounded-2xl border border-[#E8E8E8] bg-[#FAFAFA] px-6 py-10 text-center">
            <p className="text-sm font-medium font-satoshi text-foreground/70">
              {activeTab === "bookings"
                ? t("account.bookings.empty.bookings")
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
  );
}
