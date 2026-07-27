"use client";

import { CalendarDays, ChevronDown, LayoutList, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { VendorBookingCard } from "@/features/vendor/components/vendor-booking-card";
import {
  computeVendorBookingStats,
  getVendorBookingListingOptions,
  getVendorBookingTab,
  isWithinDateRange,
  VENDOR_BOOKING_DATE_RANGE_OPTIONS,
  VENDOR_BOOKINGS,
  type VendorBooking,
  type VendorBookingDateRange,
  type VendorBookingTab,
} from "@/features/vendor/data/vendor-bookings";
import { useFormatPrice } from "@/hooks/use-format-price";
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

const STAT_CONFIG = [
  {
    key: "awaitingConfirmation",
    labelKey: "vendor.bookings.stats.awaitingConfirmation",
    valueClassName: "text-[#D85A30]",
  },
  {
    key: "upcomingConfirmed",
    labelKey: "vendor.bookings.stats.upcomingConfirmed",
    valueClassName: "text-[#135391]",
  },
  {
    key: "earningsThisMonth",
    labelKey: "vendor.bookings.stats.earningsThisMonth",
    valueClassName: "text-[#2E7D32]",
  },
  {
    key: "responseRate",
    labelKey: "vendor.bookings.stats.responseRate",
    valueClassName: "text-[#C0392B]",
  },
] as const;

type VendorBookingsContentProps = {
  vendorName?: string | null;
};

export function VendorBookingsContent({
  vendorName = "Alex Autos",
}: VendorBookingsContentProps) {
  const t = useTranslation();
  const formatPrice = useFormatPrice();
  const displayName = vendorName?.trim() || "Alex Autos";
  const [activeTab, setActiveTab] = useState<VendorBookingTab>("upcoming");
  const [dateRange, setDateRange] = useState<VendorBookingDateRange>("all");
  const [listingFilter, setListingFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [bookings, setBookings] = useState<VendorBooking[]>(VENDOR_BOOKINGS);

  const listingOptions = useMemo(
    () => getVendorBookingListingOptions(bookings),
    [bookings],
  );

  const stats = useMemo(() => computeVendorBookingStats(bookings), [bookings]);

  const filteredBookings = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return bookings
      .filter((booking) => getVendorBookingTab(booking) === activeTab)
      .filter((booking) => isWithinDateRange(booking.experienceDate, dateRange))
      .filter(
        (booking) =>
          listingFilter === "all" || booking.listingId === listingFilter,
      )
      .filter((booking) => {
        if (!normalizedQuery) {
          return true;
        }

        return (
          booking.guestFirstName.toLowerCase().includes(normalizedQuery) ||
          booking.bookingReference.toLowerCase().includes(normalizedQuery)
        );
      })
      .sort(
        (left, right) =>
          new Date(left.experienceDate).getTime() -
          new Date(right.experienceDate).getTime(),
      );
  }, [activeTab, bookings, dateRange, listingFilter, searchQuery]);

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

  const handleCancel = (id: string) => {
    setBookings((current) =>
      current.map((booking) =>
        booking.id === id ? { ...booking, status: "cancelled" } : booking,
      ),
    );
  };

  const getStatValue = (key: (typeof STAT_CONFIG)[number]["key"]) => {
    switch (key) {
      case "awaitingConfirmation":
        return String(stats.awaitingConfirmation);
      case "upcomingConfirmed":
        return String(stats.upcomingConfirmed);
      case "earningsThisMonth":
        return formatPrice(stats.earningsCurrency, stats.earningsThisMonth);
      case "responseRate":
        return `${stats.responseRate}%`;
    }
  };

  return (
    <>
      <h2 className="text-xl font-medium font-satoshi text-[#2F2F2F]">
        {t("vendor.dashboard.welcomeBack")}{" "}
        <span className="font-bold text-[#D85A30]">{displayName}</span>
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STAT_CONFIG.map((stat) => (
          <div
            key={stat.key}
            className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-bold font-satoshi text-[#3C3C3C]">
              {t(stat.labelKey)}
            </p>
            <p
              className={`mt-2 text-3xl font-bold font-inter ${stat.valueClassName}`}
            >
              {getStatValue(stat.key)}
            </p>
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-[#EEEEEE] bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">{t("vendor.bookings.searchPlaceholder")}</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t("vendor.bookings.searchPlaceholder")}
              className="h-11 w-full rounded-full border border-[#E5E5E5] bg-[#FAFAFA] pl-11 pr-4 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none focus:border-[#135391]"
            />
          </label>

          <label className="relative w-full sm:w-auto sm:min-w-[180px]">
            <span className="sr-only">{t("vendor.bookings.allListings")}</span>
            <select
              value={listingFilter}
              onChange={(event) => setListingFilter(event.target.value)}
              className="h-11 w-full appearance-none rounded-full border border-[#E5E5E5] bg-white px-4 pr-9 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none focus:border-[#135391]"
            >
              <option value="all">{t("vendor.bookings.allListings")}</option>
              {listingOptions.map((listing) => (
                <option key={listing.id} value={listing.id}>
                  {listing.title}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]" />
          </label>

          <div
            className="inline-flex w-full rounded-full border border-[#E5E5E5] bg-[#FAFAFA] p-1 sm:w-auto"
            role="group"
            aria-label={t("vendor.bookings.viewModeLabel")}
          >
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`inline-flex w-1/2 flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-bold font-satoshi transition-colors sm:flex-none ${
                viewMode === "list"
                  ? "bg-[#2F2F2F] text-white"
                  : "text-[#676565] hover:text-[#2F2F2F]"
              }`}
            >
              <LayoutList className="h-4 w-4" strokeWidth={2} />
              {t("vendor.bookings.view.list")}
            </button>
            <button
              type="button"
              onClick={() => setViewMode("calendar")}
              className={`inline-flex w-1/2 flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-bold font-satoshi transition-colors sm:flex-none ${
                viewMode === "calendar"
                  ? "bg-[#2F2F2F] text-white"
                  : "text-[#676565] hover:text-[#2F2F2F]"
              }`}
            >
              <CalendarDays className="h-4 w-4" strokeWidth={2} />
              {t("vendor.bookings.view.calendar")}
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 border-b border-[#E8E8E8] pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-6 overflow-x-auto">
            {(["upcoming", "past", "cancelled"] as const).map((tabId) => {
              const isActive = activeTab === tabId;

              return (
                <button
                  key={tabId}
                  type="button"
                  onClick={() => setActiveTab(tabId)}
                  className={`shrink-0 pb-3 text-sm font-bold font-satoshi transition-colors ${
                    isActive
                      ? "border-b-2 border-[#D85A30] text-[#2F2F2F]"
                      : "text-[#676565] hover:text-[#2F2F2F]"
                  }`}
                >
                  {t(TAB_KEYS[tabId])}
                </button>
              );
            })}
          </div>

          <label className="relative w-full sm:w-auto sm:min-w-[160px]">
            <span className="sr-only">{t("vendor.bookings.dateRangeLabel")}</span>
            <select
              value={dateRange}
              onChange={(event) =>
                setDateRange(event.target.value as VendorBookingDateRange)
              }
              className="h-10 w-full appearance-none rounded-full border border-[#E5E5E5] bg-white px-4 pr-9 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none focus:border-[#135391]"
            >
              {VENDOR_BOOKING_DATE_RANGE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {t(DATE_RANGE_LABEL_KEYS[option])}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]" />
          </label>
        </div>

        <div className="mt-6 space-y-4">
          {viewMode === "calendar" ? (
            <div className="rounded-xl border border-dashed border-[#E5E5E5] bg-[#FAFAFA] p-10 text-center">
              <CalendarDays
                className="mx-auto h-8 w-8 text-[#676565]"
                strokeWidth={1.75}
              />
              <p className="mt-3 text-sm font-medium font-satoshi text-[#676565]">
                {t("vendor.bookings.calendarComingSoon")}
              </p>
            </div>
          ) : filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <VendorBookingCard
                key={booking.id}
                booking={booking}
                showActions={activeTab === "upcoming"}
                onConfirm={handleConfirm}
                onDecline={handleDecline}
                onComplete={handleComplete}
                onCancel={handleCancel}
              />
            ))
          ) : (
            <div className="rounded-xl border border-[#EEEEEE] bg-[#FAFAFA] p-10 text-center">
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
