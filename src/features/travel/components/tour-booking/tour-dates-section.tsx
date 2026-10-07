"use client";

import { CalendarDays, Clock, Users } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import {
  hoursBetween,
  isTourDateBookable,
  todayDateKey,
  tourGuestBounds,
} from "@/features/travel/booking/tour-schedule";
import { BookingCounterField } from "@/features/travel/components/booking/booking-counter-field";
import { BookingDateTimePicker } from "@/features/travel/components/booking/booking-date-time-picker";
import type { BookingTimeSlot } from "@/features/travel/data/property-availability";
import type { TourDetail } from "@/features/travel/data/tour-booking";
import { useTranslation } from "@/hooks/use-translation";

type TourDatesSectionProps = {
  tour: TourDetail;
  selectedDate: string;
  selectedTime: string;
  guests: number;
  days: number;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  onGuestsChange: (value: number) => void;
  onDaysChange: (value: number) => void;
};

export function TourDatesSection({
  tour,
  selectedDate,
  selectedTime,
  guests,
  days,
  onDateChange,
  onTimeChange,
  onGuestsChange,
  onDaysChange,
}: TourDatesSectionProps) {
  const t = useTranslation();
  const [viewDate, setViewDate] = useState(() => new Date());

  const timeSlots = useMemo<BookingTimeSlot[]>(
    () =>
      (tour.timeSlots ?? []).map((time) => ({
        id: time,
        time,
        available: true,
      })),
    [tour.timeSlots],
  );

  const isDateDisabled = useCallback(
    (dateKey: string) => !isTourDateBookable(tour, dateKey, todayDateKey()),
    [tour],
  );

  const { min: minGuests, max: maxGuests } = tourGuestBounds(tour);
  const hasGuestLimits =
    tour.minGuests !== undefined || tour.maxGuests !== undefined;

  // "Runs 09:00–16:00 · 6 hours" from the vendor's schedule, when set.
  const scheduleHint = useMemo(() => {
    const start = tour.schedule?.startTime ?? null;
    const end = tour.schedule?.endTime ?? null;
    const computedHours = start && end ? hoursBetween(start, end) : null;
    const duration =
      tour.duration ||
      (computedHours !== null
        ? t("booking.dateTime.durationHours", { count: computedHours })
        : "");

    const runs =
      start && end
        ? t("booking.dateTime.runsWindow", { start, end })
        : start
          ? t("booking.dateTime.startsAt", { time: start })
          : "";

    if (!runs) return "";
    return duration ? `${runs} · ${duration}` : runs;
  }, [tour.schedule, tour.duration, t]);

  return (
    <div className="space-y-4">
      <BookingDateTimePicker
        mode="single"
        viewDate={viewDate}
        onViewDateChange={setViewDate}
        isDateDisabled={isDateDisabled}
        checkIn={null}
        checkOut={null}
        selectedDate={selectedDate}
        onSelectCheckIn={() => undefined}
        onSelectCheckOut={() => undefined}
        onSelectDate={onDateChange}
        timeSlots={timeSlots}
        selectedTime={selectedTime}
        onSelectTime={onTimeChange}
        showTimeSlots={timeSlots.length > 0}
      />

      {scheduleHint ? (
        <p className="flex items-center gap-2 px-1 text-sm font-medium font-satoshi text-[#676565]">
          <Clock className="h-4 w-4" />
          {scheduleHint}
        </p>
      ) : null}

      <div className="grid gap-3 rounded-[25px] border border-[#E5E5E5] bg-[#B4B4B4]/35 p-3 sm:grid-cols-2">
        <BookingCounterField
          icon={<CalendarDays className="h-4 w-4" />}
          label={t("booking.dates.days")}
          value={days}
          min={1}
          max={14}
          decreaseLabel={t("booking.dates.decreaseDays")}
          increaseLabel={t("booking.dates.increaseDays")}
          onChange={onDaysChange}
        />
        <div>
          <BookingCounterField
            icon={<Users className="h-4 w-4" />}
            label={t("booking.dates.guests")}
            value={guests}
            min={minGuests}
            max={maxGuests ?? Number.POSITIVE_INFINITY}
            decreaseLabel={t("booking.guest.decreaseGuests")}
            increaseLabel={t("booking.guest.increaseGuests")}
            onChange={onGuestsChange}
          />
          {hasGuestLimits ? (
            <p className="mt-1.5 px-1 text-[11px] font-medium font-satoshi text-foreground/60">
              {maxGuests !== undefined
                ? t("booking.dateTime.guestLimits", {
                    min: minGuests,
                    max: maxGuests,
                  })
                : t("booking.dateTime.guestMin", { min: minGuests })}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
