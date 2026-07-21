"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";

import {
  toDateKey,
  type AvailabilityDayStatus,
} from "@/features/vendor/data/vendor-listing-availability";
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

export type CalendarEditMode = "available" | "block";

type VendorBookingAvailabilityCalendarProps = {
  viewDate: Date;
  onViewDateChange: (date: Date) => void;
  dayStatuses: Record<string, AvailabilityDayStatus>;
  selectedDateKey: string | null;
  editMode: CalendarEditMode;
  onDayClick: (dateKey: string) => void;
};

export function VendorBookingAvailabilityCalendar({
  viewDate,
  onViewDateChange,
  dayStatuses,
  selectedDateKey,
  editMode,
  onDayClick,
}: VendorBookingAvailabilityCalendarProps) {
  const t = useTranslation();
  const days = useMemo(() => buildCalendarDays(viewDate), [viewDate]);

  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(viewDate);

  const shiftMonth = (offset: number) => {
    onViewDateChange(
      new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1),
    );
  };

  return (
    <div className="rounded-[10px] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          aria-label={t("vendor.listings.calendar.previousMonth")}
          className="rounded-md p-1.5 text-[#B5BEC6] transition-colors hover:bg-[#F5F5F5]"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
        </button>

        <p className="text-sm font-medium font-satoshi text-[#4A5660]">
          {monthLabel}
        </p>

        <button
          type="button"
          onClick={() => shiftMonth(1)}
          aria-label={t("vendor.listings.calendar.nextMonth")}
          className="rounded-md p-1.5 text-[#B5BEC6] transition-colors hover:bg-[#F5F5F5]"
        >
          <ChevronRight className="h-5 w-5" strokeWidth={1.75} />
        </button>
      </div>

      <div className="mb-3 flex flex-wrap gap-3 text-[11px] font-medium font-satoshi text-[#676565]">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#D85A30]" />
          {t("vendor.listings.availability.legendAvailable")}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#C0392B]" />
          {t("vendor.listings.availability.legendBlocked")}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full ring-2 ring-[#004785] ring-offset-1" />
          {t("vendor.listings.availability.legendSelected")}
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAY_KEYS.map((key) => (
          <div
            key={key}
            className="pb-2 text-center text-[10px] font-semibold font-satoshi uppercase tracking-wide text-[#B5BEC6]"
          >
            {t(key)}
          </div>
        ))}

        {days.map(({ date, inMonth }) => {
          const dateKey = toDateKey(date);
          const day = date.getDate();
          const status = dayStatuses[dateKey];
          const isSelected = selectedDateKey === dateKey;
          const isBlocked = status === "blocked";
          const isAvailable = status === "available";

          return (
            <button
              key={`${dateKey}-${inMonth}`}
              type="button"
              disabled={!inMonth}
              onClick={() => inMonth && onDayClick(dateKey)}
              aria-pressed={isSelected}
              aria-label={
                inMonth
                  ? `${day}${isBlocked ? `, ${t("vendor.listings.availability.blocked")}` : isAvailable ? `, ${t("vendor.listings.availability.available")}` : ""}`
                  : undefined
              }
              className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium font-satoshi transition-colors ${
                !inMonth
                  ? "cursor-default text-transparent"
                  : isSelected
                    ? "bg-[#004785] text-white ring-2 ring-[#004785] ring-offset-2"
                    : isBlocked
                      ? "bg-[#C0392B] text-white"
                      : isAvailable
                        ? "bg-[#D85A30] text-white"
                        : editMode === "block"
                          ? "text-[#4A5660] hover:bg-[#FDEBEB]"
                          : "text-[#4A5660] hover:bg-[#FFF1EB]"
              }`}
            >
              {inMonth ? day : ""}
            </button>
          );
        })}
      </div>
    </div>
  );
}
