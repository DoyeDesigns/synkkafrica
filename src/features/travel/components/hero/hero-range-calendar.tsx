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

const MONTH_FORMATTER = new Intl.DateTimeFormat(undefined, { month: "long" });

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

function yearRange(minDate: string | null | undefined, maxDate: string | null | undefined) {
  const today = new Date();
  const minYear = minDate ? Number(minDate.slice(0, 4)) : 1920;
  const maxYear = maxDate ? Number(maxDate.slice(0, 4)) : today.getFullYear() + 20;
  const years: number[] = [];

  for (let year = minYear; year <= maxYear; year += 1) {
    years.push(year);
  }

  return years;
}

export type HeroRangeCalendarProps = {
  mode: "range" | "single";
  fromDate: string | null;
  toDate: string | null;
  onFromChange: (dateKey: string) => void;
  onToChange: (dateKey: string) => void;
  minDate?: string | null;
  maxDate?: string | null;
  disablePast?: boolean;
  blockedDates?: Record<string, "available" | "blocked">;
  showCaptionDropdown?: boolean;
};

type MonthGridProps = {
  viewDate: Date;
  mode: "range" | "single";
  fromDate: string | null;
  toDate: string | null;
  todayKey: string;
  minDate?: string | null;
  maxDate?: string | null;
  disablePast: boolean;
  blockedDates?: Record<string, "available" | "blocked">;
  showCaptionDropdown: boolean;
  years: number[];
  onDayClick: (dateKey: string) => void;
  onMonthChange?: (date: Date) => void;
};

function isDateDisabled(
  dateKey: string,
  {
    todayKey,
    minDate,
    maxDate,
    disablePast,
    blockedDates,
  }: {
    todayKey: string;
    minDate?: string | null;
    maxDate?: string | null;
    disablePast: boolean;
    blockedDates?: Record<string, "available" | "blocked">;
  },
) {
  if (blockedDates?.[dateKey] === "blocked") {
    return true;
  }

  if (minDate && dateKey < minDate) {
    return true;
  }

  if (maxDate && dateKey > maxDate) {
    return true;
  }

  if (!minDate && disablePast && dateKey < todayKey) {
    return true;
  }

  return false;
}

function MonthGrid({
  viewDate,
  mode,
  fromDate,
  toDate,
  todayKey,
  minDate,
  maxDate,
  disablePast,
  blockedDates,
  showCaptionDropdown,
  years,
  onDayClick,
  onMonthChange,
}: MonthGridProps) {
  const t = useTranslation();
  const days = useMemo(() => buildCalendarDays(viewDate), [viewDate]);
  const monthLabel = new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(viewDate);
  const hasCompleteRange = Boolean(fromDate && toDate);
  const selectClassName =
    "rounded-md border border-[#E5E5E5] bg-white px-2 py-1 text-sm font-semibold font-satoshi text-[#2F2F2F] outline-none focus:border-[#004785]";

  return (
    <div className="min-w-0 flex-1 sm:min-w-63">
      {showCaptionDropdown && onMonthChange ? (
        <div className="mb-3 flex items-center justify-center gap-2">
          <select
            aria-label="Month"
            className={selectClassName}
            value={viewDate.getMonth()}
            onChange={(event) =>
              onMonthChange(new Date(viewDate.getFullYear(), Number(event.target.value), 1))
            }
          >
            {Array.from({ length: 12 }, (_, month) => (
              <option key={month} value={month}>
                {MONTH_FORMATTER.format(new Date(2000, month, 1))}
              </option>
            ))}
          </select>
          <select
            aria-label="Year"
            className={selectClassName}
            value={viewDate.getFullYear()}
            onChange={(event) =>
              onMonthChange(new Date(Number(event.target.value), viewDate.getMonth(), 1))
            }
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <p className="mb-3 text-center text-sm font-semibold font-satoshi text-[#2F2F2F]">
          {monthLabel}
        </p>
      )}

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
          const isUnavailable = isDateDisabled(dateKey, {
            todayKey,
            minDate,
            maxDate,
            disablePast,
            blockedDates,
          });
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

          return (
            <div
              key={`${dateKey}-${inMonth}`}
              className="relative flex h-9 items-center justify-center"
            >
              <button
                type="button"
                disabled={!inMonth || isUnavailable}
                onClick={() => onDayClick(dateKey)}
                aria-pressed={isEndpoint || isRangeMiddle}
                className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium font-satoshi transition-colors ${
                  !inMonth
                    ? "cursor-default bg-transparent text-transparent"
                    : isUnavailable
                      ? "cursor-not-allowed text-[#B5BEC6] line-through"
                      : isEndpoint
                        ? "bg-[#004785] text-white"
                        : isRangeMiddle
                          ? "bg-[#004785]/15 text-[#004785] hover:bg-[#004785]/25"
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
  minDate,
  maxDate,
  disablePast = true,
  blockedDates,
  showCaptionDropdown = false,
}: HeroRangeCalendarProps) {
  const t = useTranslation();
  const todayKey = toDateKey(new Date());
  const years = useMemo(() => yearRange(minDate, maxDate), [minDate, maxDate]);
  const [viewDate, setViewDate] = useState(() => {
    const initial = fromDate ? new Date(`${fromDate}T12:00:00`) : new Date();
    return new Date(initial.getFullYear(), initial.getMonth(), 1);
  });

  const shiftMonth = (offset: number) => {
    setViewDate((current) => addMonths(current, offset));
  };

  const handleDayClick = (dateKey: string) => {
    if (
      isDateDisabled(dateKey, {
        todayKey,
        minDate,
        maxDate,
        disablePast,
        blockedDates,
      })
    ) {
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
  const gridProps = {
    mode,
    fromDate,
    toDate,
    todayKey,
    minDate,
    maxDate,
    disablePast,
    blockedDates,
    showCaptionDropdown,
    years,
    onDayClick: handleDayClick,
  };

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
          {...gridProps}
          viewDate={viewDate}
          onMonthChange={setViewDate}
        />
        {mode === "range" ? (
          <MonthGrid
            {...gridProps}
            viewDate={secondMonth}
            showCaptionDropdown={false}
          />
        ) : null}
      </div>
    </div>
  );
}
