"use client";

import { CalendarDays, Users } from "lucide-react";
import { useState } from "react";

import { BookingCounterField } from "@/features/travel/components/booking/booking-counter-field";
import { BookingDateTimePicker } from "@/features/travel/components/booking/booking-date-time-picker";
import {
  getTourDayStatuses,
  getTourTimeSlots,
} from "@/features/travel/data/property-availability";
import { useTranslation } from "@/hooks/use-translation";

type TourDatesSectionProps = {
  tourId: string;
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
  tourId,
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
  const [viewDate, setViewDate] = useState(() => new Date(selectedDate || Date.now()));
  const dayStatuses = getTourDayStatuses(tourId);
  const timeSlots = getTourTimeSlots();

  return (
    <div className="space-y-4">
      <BookingDateTimePicker
        mode="single"
        viewDate={viewDate}
        onViewDateChange={setViewDate}
        blockedDates={dayStatuses}
        checkIn={null}
        checkOut={null}
        selectedDate={selectedDate}
        onSelectCheckIn={() => undefined}
        onSelectCheckOut={() => undefined}
        onSelectDate={onDateChange}
        timeSlots={timeSlots}
        selectedTime={selectedTime}
        onSelectTime={onTimeChange}
      />

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
        <BookingCounterField
          icon={<Users className="h-4 w-4" />}
          label={t("booking.dates.guests")}
          value={guests}
          min={1}
          max={12}
          decreaseLabel={t("booking.guest.decreaseGuests")}
          increaseLabel={t("booking.guest.increaseGuests")}
          onChange={onGuestsChange}
        />
      </div>
    </div>
  );
}
