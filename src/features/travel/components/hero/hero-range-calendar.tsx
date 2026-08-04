"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { toDateKey } from "@/features/vendor/data/vendor-listing-availability";
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

function isBetween(dateKey: string, start: string | null, end: string | null) {
  if (!start || !end) return false;
  return dateKey > start && dateKey < end;
}

type RangePosition = "start" | "middle" | "end" | "none";

function getRangePosition(
  dateKey: string,
  from: string | null,
  to: string | null,
): RangePosition {
  if (!from || !to) {
    return "none";
  }

  if (dateKey === from) {
    return "start";
  }

  if (dateKey === to) {
    return "end";
  }

  if (isBetween(dateKey, from, to)) {
    return "middle";
  }

  return "none";
}

function addMonths(date: Date, offset: number) {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1);
}

type HeroRangeCalendarProps = {
  mode: "range" | "single";
  fromDate: string | null;
  toDate: string | null;
  onFromChange: (dateKey: string) => void;
  onToChange: (dateKey: string) => void;
};

type MonthGridProps = {
  viewDate: Date;
  mode: "range" | "single";
  fromDate: string | null;
  toDate: string | null;
  todayKey: string;
  onDayClick: (dateKey: string) => void;
};

function MonthGrid({
  viewDate,
  mode,
  fromDate,
  toDate,
  todayKey,
  onDayClick,
}: MonthGridProps) {
  const t = useTranslation();
  const days = useMemo(() => buildCalendarDays(viewDate), [viewDate]);
  const monthLabel = new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(viewDate);
  const hasCompleteRange = Boolean(fromDate && toDate);

  return (
    <div className="min-w-0 flex-1 sm:min-w-63">
      <p className="mb-3 text-center text-sm font-semibold font-satoshi text-[#2F2F2F]">
        {monthLabel}
      </p>

      <div className="grid grid-cols-7">
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
          const isPast = dateKey < todayKey;
          const isDisabled = !inMonth || isPast;
          const isFromOnly =
            mode === "range" && fromDate && !toDate && dateKey === fromDate;
          const rangePosition =
            mode === "range" && hasCompleteRange
              ? getRangePosition(dateKey, fromDate, toDate)
              : "none";
          const isRangeStart = rangePosition === "start";
          const isRangeEnd = rangePosition === "end";
          const isRangeMiddle = rangePosition === "middle";
          const isSelectedSingle = mode === "single" && fromDate === dateKey;
          const isEndpoint =
            isFromOnly || isRangeStart || isRangeEnd || isSelectedSingle;

          const cellRangeClass = isRangeMiddle
            ? "bg-[rgb(0_71_133/0.15)]"
            : isRangeStart && !isRangeEnd
              ? "bg-[linear-gradient(to_right,transparent_50%,rgb(0_71_133/0.15)_50%)]"
              : isRangeEnd && !isRangeStart
                ? "bg-[linear-gradient(to_right,rgb(0_71_133/0.15)_50%,transparent_50%)]"
                : "";

          return (
            <div
              key={`${dateKey}-${inMonth}`}
              className="relative flex h-9 items-center justify-center"
            >
              {cellRangeClass ? (
                <div
                  aria-hidden
                  className={`absolute top-1/2 h-8 w-full -translate-y-1/2 ${cellRangeClass}`}
                />
              ) : null}

              <button
                type="button"
                disabled={isDisabled}
                onClick={() => onDayClick(dateKey)}
                aria-pressed={isEndpoint}
                className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium font-satoshi transition-colors ${
                  !inMonth
                    ? "cursor-default bg-transparent text-transparent"
                    : isPast
                      ? "cursor-not-allowed text-[#B5BEC6] line-through"
                      : isEndpoint
                        ? "bg-[#004785] text-white"
                        : isRangeMiddle
                          ? "bg-transparent text-[#004785] hover:bg-transparent"
                          : "bg-transparent text-[#4A5660] hover:bg-[#004785]/10"
                }`}
              >
                {inMonth ? day : ""}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function HeroRangeCalendar({
  mode,
  fromDate,
  toDate,
  onFromChange,
  onToChange,
}: HeroRangeCalendarProps) {
  const t = useTranslation();
  const todayKey = toDateKey(new Date());
  const [viewDate, setViewDate] = useState(() => {
    const initial = fromDate ? new Date(`${fromDate}T12:00:00`) : new Date();
    return new Date(initial.getFullYear(), initial.getMonth(), 1);
  });

  const shiftMonth = (offset: number) => {
    setViewDate((current) => addMonths(current, offset));
  };

  const handleDayClick = (dateKey: string) => {
    if (dateKey < todayKey) {
      return;
    }

    if (mode === "single") {
      onFromChange(dateKey);
      onToChange("");
      return;
    }

    if (!fromDate || toDate) {
      onFromChange(dateKey);
      onToChange("");
      return;
    }

    if (dateKey <= fromDate) {
      onFromChange(dateKey);
      onToChange("");
      return;
    }

    onToChange(dateKey);
  };

  const secondMonth = addMonths(viewDate, 1);

  return (
    <div className="w-full min-w-0">
      <div className="mb-4 flex w-full items-center justify-between">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          aria-label={t("vendor.listings.calendar.previousMonth")}
          className="rounded-md p-1.5 text-[#676565] transition-colors hover:bg-[#F5F5F5]"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
        </button>

        <p className="px-2 text-center text-xs font-medium font-satoshi text-[#676565]">
          {mode === "range"
            ? t("hero.common.selectDateRange")
            : t("hero.common.selectDate")}
        </p>

        <button
          type="button"
          onClick={() => shiftMonth(1)}
          aria-label={t("vendor.listings.calendar.nextMonth")}
          className="rounded-md p-1.5 text-[#676565] transition-colors hover:bg-[#F5F5F5]"
        >
          <ChevronRight className="h-5 w-5" strokeWidth={1.75} />
        </button>
      </div>

      <div
        className={`grid gap-5 ${
          mode === "range" ? "sm:grid-cols-2" : "grid-cols-1"
        }`}
      >
        <MonthGrid
          viewDate={viewDate}
          mode={mode}
          fromDate={fromDate}
          toDate={toDate}
          todayKey={todayKey}
          onDayClick={handleDayClick}
        />
        {mode === "range" ? (
          <MonthGrid
            viewDate={secondMonth}
            mode={mode}
            fromDate={fromDate}
            toDate={toDate}
            todayKey={todayKey}
            onDayClick={handleDayClick}
          />
        ) : null}
      </div>
    </div>
  );
}
