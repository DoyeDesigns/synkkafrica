"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";

import { toDateKey } from "@/features/vendor/data/vendor-listing-availability";
import type { BookingTimeSlot } from "@/features/travel/data/property-availability";
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
  checkIn: string | null,
  checkOut: string | null,
): RangePosition {
  if (!checkIn || !checkOut) {
    return "none";
  }

  if (dateKey === checkIn && dateKey === checkOut) {
    return "start";
  }

  if (dateKey === checkIn) {
    return "start";
  }

  if (dateKey === checkOut) {
    return "end";
  }

  if (isBetween(dateKey, checkIn, checkOut)) {
    return "middle";
  }

  return "none";
}

type BookingDateTimePickerProps = {
  mode: "range" | "single";
  viewDate: Date;
  onViewDateChange: (date: Date) => void;
  blockedDates: Record<string, "available" | "blocked">;
  checkIn: string | null;
  checkOut: string | null;
  selectedDate: string | null;
  onSelectCheckIn: (dateKey: string) => void;
  onSelectCheckOut: (dateKey: string) => void;
  onSelectDate: (dateKey: string) => void;
  timeSlots: BookingTimeSlot[];
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
};

export function BookingDateTimePicker({
  mode,
  viewDate,
  onViewDateChange,
  blockedDates,
  checkIn,
  checkOut,
  selectedDate,
  onSelectCheckIn,
  onSelectCheckOut,
  onSelectDate,
  timeSlots,
  selectedTime,
  onSelectTime,
}: BookingDateTimePickerProps) {
  const t = useTranslation();
  const days = useMemo(() => buildCalendarDays(viewDate), [viewDate]);
  const todayKey = toDateKey(new Date());

  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(viewDate);

  const shiftMonth = (offset: number) => {
    onViewDateChange(
      new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1),
    );
  };

  const handleDayClick = (dateKey: string) => {
    if (blockedDates[dateKey] === "blocked" || dateKey < todayKey) {
      return;
    }

    if (mode === "single") {
      onSelectDate(dateKey);
      return;
    }

    if (!checkIn || checkOut) {
      onSelectCheckIn(dateKey);
      return;
    }

    if (dateKey <= checkIn) {
      onSelectCheckIn(dateKey);
      return;
    }

    onSelectCheckOut(dateKey);
  };

  const activeDate = mode === "single" ? selectedDate : checkIn;

  return (
    <section className="rounded-[10px] border border-[#E5E5E5] bg-white p-5">
      <h2 className="text-base font-semibold font-inter text-foreground">
        {t("booking.dateTime.title")}
      </h2>
      <p className="mt-1 text-sm font-normal font-inter text-foreground/70">
        {mode === "range"
          ? t("booking.dateTime.rangeHint")
          : t("booking.dateTime.singleHint")}
      </p>

      <div className="mt-5 rounded-[10px] border border-[#E5E5E5] p-4">
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
            {t("booking.dateTime.legendAvailable")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#D9D9D9]" />
            {t("booking.dateTime.legendUnavailable")}
          </span>
        </div>

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
            const isBlocked =
              !inMonth ||
              blockedDates[dateKey] === "blocked" ||
              dateKey < todayKey;
            const hasCompleteRange = Boolean(checkIn && checkOut);
            const isCheckInOnly =
              mode === "range" && checkIn && !checkOut && dateKey === checkIn;
            const rangePosition =
              mode === "range" && hasCompleteRange
                ? getRangePosition(dateKey, checkIn, checkOut)
                : "none";
            const isRangeStart = rangePosition === "start";
            const isRangeEnd = rangePosition === "end";
            const isRangeMiddle = rangePosition === "middle";
            const isEndpoint = isCheckInOnly || isRangeStart || isRangeEnd;

            const cellRangeClass =
              isRangeMiddle
                ? "bg-[rgb(0_71_133/0.15)]"
                : isRangeStart && !isRangeEnd
                  ? "bg-[linear-gradient(to_right,transparent_50%,rgb(0_71_133/0.15)_50%)]"
                  : isRangeEnd && !isRangeStart
                    ? "bg-[linear-gradient(to_right,rgb(0_71_133/0.15)_50%,transparent_50%)]"
                    : "";

            return (
              <div
                key={`${dateKey}-${inMonth}`}
                className="relative flex h-10 items-center justify-center"
              >
                {cellRangeClass ? (
                  <div
                    aria-hidden
                    className={`absolute top-1/2 h-9 w-full -translate-y-1/2 ${cellRangeClass}`}
                  />
                ) : null}

                <button
                  type="button"
                  disabled={!inMonth || isBlocked}
                  onClick={() => handleDayClick(dateKey)}
                  aria-pressed={isEndpoint}
                  className={`relative z-10 flex h-9 w-9 items-center justify-center text-sm font-medium font-satoshi transition-colors ${
                    !inMonth
                      ? "cursor-default bg-transparent text-transparent"
                      : isBlocked
                        ? "cursor-not-allowed rounded-md bg-[#EFEFEF] text-[#B5BEC6] line-through"
                        : isEndpoint
                          ? "rounded-md bg-[#004785] text-white"
                          : isRangeMiddle
                            ? "bg-transparent text-[#004785] hover:bg-transparent"
                            : "rounded-md bg-transparent text-[#4A5660] hover:bg-[#004785]/10"
                  }`}
                >
                  {inMonth ? day : ""}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {mode === "range" && checkIn ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-[#E5E5E5] bg-[#F8F8F8] px-3 py-2.5">
            <p className="text-[11px] font-medium font-satoshi text-foreground/60">
              {t("booking.dates.checkIn")}
            </p>
            <p className="text-sm font-semibold font-satoshi text-foreground">
              {checkIn}
            </p>
          </div>
          <div className="rounded-md border border-[#E5E5E5] bg-[#F8F8F8] px-3 py-2.5">
            <p className="text-[11px] font-medium font-satoshi text-foreground/60">
              {t("booking.dates.checkOut")}
            </p>
            <p className="text-sm font-semibold font-satoshi text-foreground">
              {checkOut ?? t("booking.dateTime.selectCheckout")}
            </p>
          </div>
        </div>
      ) : null}

      {activeDate ? (
        <div className="mt-5">
          <h3 className="text-sm font-semibold font-inter text-foreground">
            {t("booking.dateTime.timeSlots")}
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {timeSlots.map((slot) => {
              const isSelected = selectedTime === slot.time;
              const disabled = !slot.available;

              return (
                <button
                  key={slot.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelectTime(slot.time)}
                  className={`rounded-md border px-4 py-2 text-sm font-medium font-satoshi transition-colors ${
                    disabled
                      ? "cursor-not-allowed border-[#E5E5E5] bg-[#F5F5F5] text-[#B5BEC6]"
                      : isSelected
                        ? "border-[#004785] bg-[#004785] text-white"
                        : "border-[#E5E5E5] bg-white text-foreground hover:border-[#D85A30]"
                  }`}
                >
                  {slot.time}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}
