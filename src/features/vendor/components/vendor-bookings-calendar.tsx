"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import {
  formatExperienceTime,
  getVendorListingHref,
  type VendorBooking,
} from "@/features/vendor/data/vendor-bookings";
import { useTranslation } from "@/hooks/use-translation";

const WEEKDAY_KEYS = [
  "vendor.listings.calendar.sun",
  "vendor.listings.calendar.mon",
  "vendor.listings.calendar.tue",
  "vendor.listings.calendar.wed",
  "vendor.listings.calendar.thu",
  "vendor.listings.calendar.fri",
  "vendor.listings.calendar.sat",
] as const;

function toDateKey(date: Date) {
  return date.toISOString().split("T")[0] ?? "";
}

function buildCalendarDays(viewDate: Date) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay();
  const days: Array<{ date: Date; inMonth: boolean }> = [];

  for (let index = 0; index < startOffset; index += 1) {
    const date = new Date(year, month, index - startOffset + 1);
    days.push({ date, inMonth: false });
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    days.push({ date: new Date(year, month, day), inMonth: true });
  }

  while (days.length % 7 !== 0) {
    const nextDay = days.length - startOffset - lastDay.getDate() + 1;
    days.push({
      date: new Date(year, month + 1, nextDay),
      inMonth: false,
    });
  }

  return days;
}

type VendorBookingsCalendarProps = {
  bookings: VendorBooking[];
};

export function VendorBookingsCalendar({ bookings }: VendorBookingsCalendarProps) {
  const t = useTranslation();
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  const days = useMemo(() => buildCalendarDays(viewDate), [viewDate]);

  const bookingsByDate = useMemo(() => {
    const grouped = new Map<string, VendorBooking[]>();

    for (const booking of bookings) {
      const key = booking.experienceDate;
      const current = grouped.get(key) ?? [];
      current.push(booking);
      grouped.set(key, current);
    }

    return grouped;
  }, [bookings]);

  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(viewDate);

  const selectedBookings = selectedDateKey
    ? (bookingsByDate.get(selectedDateKey) ?? [])
    : [];

  const shiftMonth = (offset: number) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
    setSelectedDateKey(null);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[#EEEEEE] bg-white p-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E5E5] text-[#676565] transition-colors hover:bg-[#FAFAFA]"
            aria-label={t("vendor.listings.calendar.previousMonth")}
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <p className="text-base font-bold font-satoshi text-[#2F2F2F]">{monthLabel}</p>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E5E5] text-[#676565] transition-colors hover:bg-[#FAFAFA]"
            aria-label={t("vendor.listings.calendar.nextMonth")}
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1">
          {WEEKDAY_KEYS.map((key) => (
            <div
              key={key}
              className="py-2 text-center text-[11px] font-semibold font-satoshi uppercase text-[#676565]"
            >
              {t(key)}
            </div>
          ))}

          {days.map(({ date, inMonth }) => {
            const dateKey = toDateKey(date);
            const dayBookings = bookingsByDate.get(dateKey) ?? [];
            const isSelected = selectedDateKey === dateKey;
            const hasBookings = dayBookings.length > 0;

            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => setSelectedDateKey(isSelected ? null : dateKey)}
                className={`min-h-[72px] rounded-lg border p-2 text-left transition-colors ${
                  isSelected
                    ? "border-[#135391] bg-[#F0F6FC]"
                    : hasBookings
                      ? "border-[#D85A30]/30 bg-[#FFF8F5] hover:border-[#D85A30]/50"
                      : inMonth
                        ? "border-[#F0F0F0] bg-white hover:bg-[#FAFAFA]"
                        : "border-transparent bg-[#FAFAFA] text-[#B0B0B0]"
                }`}
              >
                <span
                  className={`text-sm font-bold font-satoshi ${
                    inMonth ? "text-[#2F2F2F]" : "text-[#B0B0B0]"
                  }`}
                >
                  {date.getDate()}
                </span>
                {hasBookings ? (
                  <div className="mt-1 space-y-1">
                    {dayBookings.slice(0, 2).map((booking) => (
                      <p
                        key={booking.id}
                        className="truncate text-[10px] font-semibold font-satoshi text-[#D85A30]"
                      >
                        {booking.guestFirstName}
                      </p>
                    ))}
                    {dayBookings.length > 2 ? (
                      <p className="text-[10px] font-medium font-satoshi text-[#676565]">
                        +{dayBookings.length - 2} more
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDateKey ? (
        <div className="rounded-xl border border-[#EEEEEE] bg-[#FAFAFA] p-4">
          <h3 className="text-sm font-bold font-satoshi text-[#2F2F2F]">
            {t("vendor.bookings.calendar.selectedDay", {
              count: selectedBookings.length,
            })}
          </h3>
          {selectedBookings.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {selectedBookings.map((booking) => (
                <li
                  key={booking.id}
                  className="rounded-lg border border-[#EEEEEE] bg-white px-3 py-2"
                >
                  <p className="text-sm font-bold font-satoshi">
                    <Link
                      href={getVendorListingHref(booking.listingId)}
                      className="text-[#135391] underline underline-offset-2 transition-colors hover:text-[#004785]"
                    >
                      {booking.listingTitle}
                    </Link>
                  </p>
                  <p className="mt-0.5 text-xs font-medium font-satoshi text-[#676565]">
                    {booking.guestFirstName} · {formatExperienceTime(booking.experienceTime)} ·{" "}
                    {booking.bookingReference}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm font-medium font-satoshi text-[#676565]">
              {t("vendor.bookings.calendar.noBookings")}
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
