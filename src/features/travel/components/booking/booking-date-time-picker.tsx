"use client";

import { HeroRangeCalendar } from "@/features/travel/components/hero/hero-range-calendar";
import type { BookingTimeSlot } from "@/features/travel/data/property-availability";
import { useTranslation } from "@/hooks/use-translation";

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
  showTimeSlots?: boolean;
};

export function BookingDateTimePicker({
  mode,
  blockedDates,
  checkIn,
  checkOut,
  selectedDate,
  onSelectCheckIn,
  onSelectCheckOut,
  onSelectDate,
}: BookingDateTimePickerProps) {
  const t = useTranslation();

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

        <HeroRangeCalendar
          mode={mode}
          fromDate={mode === "single" ? selectedDate : checkIn}
          toDate={mode === "range" ? checkOut : null}
          onFromChange={mode === "single" ? onSelectDate : onSelectCheckIn}
          onToChange={(dateKey) => {
            if (mode === "range" && dateKey) {
              onSelectCheckOut(dateKey);
            }
          }}
          blockedDates={blockedDates}
        />
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

      {/* Time slots commented out for accommodations, tours, and cars.
      {showTimeSlots && (mode === "single" ? selectedDate : checkIn) ? (
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
      */}
    </section>
  );
}
