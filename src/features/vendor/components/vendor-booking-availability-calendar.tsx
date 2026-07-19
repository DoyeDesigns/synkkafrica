"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

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

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}`;
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

type VendorBookingAvailabilityCalendarProps = {
  initialMonth?: Date;
  initialSelectedDays?: number[];
};

export function VendorBookingAvailabilityCalendar({
  initialMonth = new Date(2026, 8, 1),
  initialSelectedDays = [9, 19, 20, 21, 30],
}: VendorBookingAvailabilityCalendarProps) {
  const t = useTranslation();
  const [viewDate, setViewDate] = useState(initialMonth);
  const [selectedByMonth, setSelectedByMonth] = useState<Record<string, number[]>>({
    [getMonthKey(initialMonth)]: initialSelectedDays,
  });

  const monthKey = getMonthKey(viewDate);
  const selectedDays = selectedByMonth[monthKey] ?? [];
  const days = useMemo(() => buildCalendarDays(viewDate), [viewDate]);

  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(viewDate);

  const shiftMonth = (offset: number) => {
    setViewDate(
      (current) => new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  };

  const toggleDay = (day: number) => {
    setSelectedByMonth((current) => {
      const existing = current[monthKey] ?? [];
      const next = existing.includes(day)
        ? existing.filter((value) => value !== day)
        : [...existing, day].sort((a, b) => a - b);

      return { ...current, [monthKey]: next };
    });
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
          const day = date.getDate();
          const isSelected = inMonth && selectedDays.includes(day);

          return (
            <button
              key={`${date.toISOString()}-${inMonth}`}
              type="button"
              disabled={!inMonth}
              onClick={() => inMonth && toggleDay(day)}
              className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium font-satoshi transition-colors ${
                !inMonth
                  ? "cursor-pointer text-transparent"
                  : isSelected
                    ? "bg-[#D85A30] text-white"
                    : "text-[#4A5660] hover:bg-[#F5F5F5]"
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
