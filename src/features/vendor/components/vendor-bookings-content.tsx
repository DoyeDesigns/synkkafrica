"use client";

import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";

import { VendorBookingCard } from "@/features/vendor/components/vendor-booking-card";
import {
  getVendorBookingTab,
  isWithinDateRange,
  VENDOR_BOOKING_DATE_RANGE_OPTIONS,
  VENDOR_BOOKINGS,
  type VendorBooking,
  type VendorBookingDateRange,
  type VendorBookingTab,
} from "@/features/vendor/data/vendor-bookings";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

const TAB_KEYS: Record<VendorBookingTab, TranslationKey> = {
  upcoming: "vendor.bookings.tab.upcoming",
  past: "vendor.bookings.tab.past",
  cancelled: "vendor.bookings.tab.cancelled",
};

const DATE_RANGE_LABEL_KEYS: Record<VendorBookingDateRange, TranslationKey> = {
  all: "vendor.bookings.dateRange.all",
  pastMonth: "vendor.bookings.dateRange.pastMonth",
  past3Months: "vendor.bookings.dateRange.past3Months",
  past6Months: "vendor.bookings.dateRange.past6Months",
  pastYear: "vendor.bookings.dateRange.pastYear",
};

const EMPTY_STATE_KEYS: Record<VendorBookingTab, TranslationKey> = {
  upcoming: "vendor.bookings.empty.upcoming",
  past: "vendor.bookings.empty.past",
  cancelled: "vendor.bookings.empty.cancelled",
};

type VendorBookingsContentProps = {
  vendorName?: string | null;
};

export function VendorBookingsContent({
  vendorName = "Alex Autos",
}: VendorBookingsContentProps) {
  const t = useTranslation();
  const displayName = vendorName?.trim() || "Alex Autos";
  const [activeTab, setActiveTab] = useState<VendorBookingTab>("upcoming");
  const [dateRange, setDateRange] = useState<VendorBookingDateRange>("all");
  const [bookings, setBookings] = useState<VendorBooking[]>(VENDOR_BOOKINGS);

  const filteredBookings = useMemo(
    () =>
      bookings
        .filter(
          (booking) =>
            getVendorBookingTab(booking) === activeTab &&
            isWithinDateRange(booking.experienceDate, dateRange),
        )
        .sort(
          (left, right) =>
            new Date(left.experienceDate).getTime() -
            new Date(right.experienceDate).getTime(),
        ),
    [activeTab, bookings, dateRange],
  );

  const pendingCount = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          getVendorBookingTab(booking) === "upcoming" &&
          booking.status === "awaiting_confirmation",
      ).length,
    [bookings],
  );

  const handleConfirm = (id: string) => {
    setBookings((current) =>
      current.map((booking) =>
        booking.id === id ? { ...booking, status: "confirmed" } : booking,
      ),
    );
  };

  const handleDecline = (id: string) => {
    setBookings((current) =>
      current.map((booking) =>
        booking.id === id ? { ...booking, status: "declined" } : booking,
      ),
    );
  };

  const handleComplete = (id: string) => {
    setBookings((current) =>
      current.map((booking) =>
        booking.id === id ? { ...booking, status: "completed" } : booking,
      ),
    );
  };

  return (
    <>
      <h2 className="text-xl font-medium font-satoshi text-[#2F2F2F]">
        {t("vendor.dashboard.welcomeBack")}{" "}
        <span className="font-bold text-[#D85A30]">{displayName}</span>
      </h2>

      <section className="rounded-xl border border-[#EEEEEE] bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 border-b border-[#E8E8E8] pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold font-satoshi text-[#2F2F2F]">
              {t("vendor.nav.bookings")}{" "}
              <span className="text-[#D85A30]">({filteredBookings.length})</span>
            </h3>
            {pendingCount > 0 ? (
              <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
                {t("vendor.bookings.pendingConfirmation", { count: pendingCount })}
              </p>
            ) : null}
          </div>

          <label className="relative w-full sm:w-auto sm:min-w-[180px]">
            <span className="sr-only">{t("vendor.bookings.dateRangeLabel")}</span>
            <select
              value={dateRange}
              onChange={(event) =>
                setDateRange(event.target.value as VendorBookingDateRange)
              }
              className="h-11 w-full appearance-none rounded-[25px] border border-[#D0D0D0] bg-[#A2A2A2]/10 px-4 pr-9 text-sm font-medium font-satoshi text-foreground outline-none focus:border-[#D85A30]"
            >
              {VENDOR_BOOKING_DATE_RANGE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {t(DATE_RANGE_LABEL_KEYS[option])}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground" />
          </label>
        </div>

        <div className="mt-4 flex items-center gap-6 overflow-x-auto border-b border-[#E8E8E8]">
          {(["upcoming", "past", "cancelled"] as const).map((tabId) => {
            const isActive = activeTab === tabId;

            return (
              <button
                key={tabId}
                type="button"
                onClick={() => setActiveTab(tabId)}
                className={`shrink-0 pb-3 text-sm font-medium font-satoshi transition-colors ${
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

        <div className="mt-6 space-y-4">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <VendorBookingCard
                key={booking.id}
                booking={booking}
                showActions={activeTab === "upcoming"}
                onConfirm={handleConfirm}
                onDecline={handleDecline}
                onComplete={handleComplete}
              />
            ))
          ) : (
            <div className="rounded-[5px] border border-[#EEEEEE] bg-[#F5F5F5] p-8 text-center">
              <p className="text-sm font-medium font-satoshi text-[#676565]">
                {t(EMPTY_STATE_KEYS[activeTab])}
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
