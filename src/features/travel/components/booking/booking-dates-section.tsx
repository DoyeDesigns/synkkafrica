"use client";

import { BedDouble, CalendarDays, Users } from "lucide-react";
import { useState } from "react";

import {
  calculateNights,
  getCheckOutFromNights,
  getDefaultCheckOutDate,
} from "@/features/travel/booking/booking-params";
import { BookingCounterField } from "@/features/travel/components/booking/booking-counter-field";
import { BookingDateTimePicker } from "@/features/travel/components/booking/booking-date-time-picker";
import {
  getPropertyDayStatuses,
  getPropertyTimeSlots,
  clampCheckoutDate,
} from "@/features/travel/data/property-availability";
import { useTranslation } from "@/hooks/use-translation";

type BookingDatesSectionProps = {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  selectedTime: string;
  onCheckInChange: (value: string) => void;
  onCheckOutChange: (value: string) => void;
  onGuestsChange: (value: number) => void;
  onRoomsChange: (value: number) => void;
  onTimeChange: (value: string) => void;
};

export function BookingDatesSection({
  propertyId,
  checkIn,
  checkOut,
  guests,
  rooms,
  selectedTime,
  onCheckInChange,
  onCheckOutChange,
  onGuestsChange,
  onRoomsChange,
  onTimeChange,
}: BookingDatesSectionProps) {
  const t = useTranslation();
  const [viewDate, setViewDate] = useState(() => new Date(checkIn || Date.now()));
  const dayStatuses = getPropertyDayStatuses(propertyId);
  const timeSlots = getPropertyTimeSlots();
  const nights = calculateNights(checkIn, checkOut);

  const handleSelectCheckIn = (dateKey: string) => {
    onCheckInChange(dateKey);
    onCheckOutChange("");
  };

  const handleSelectCheckOut = (dateKey: string) => {
    if (!checkIn) {
      return;
    }

    onCheckOutChange(clampCheckoutDate(dayStatuses, checkIn, dateKey));
  };

  const handleNightsChange = (value: number) => {
    if (!checkIn) {
      return;
    }

    onCheckOutChange(
      clampCheckoutDate(dayStatuses, checkIn, getCheckOutFromNights(checkIn, value)),
    );
  };

  return (
    <div className="space-y-4">
      <BookingDateTimePicker
        mode="range"
        viewDate={viewDate}
        onViewDateChange={setViewDate}
        blockedDates={dayStatuses}
        checkIn={checkIn}
        checkOut={checkOut}
        selectedDate={null}
        onSelectCheckIn={handleSelectCheckIn}
        onSelectCheckOut={handleSelectCheckOut}
        onSelectDate={() => undefined}
        timeSlots={timeSlots}
        selectedTime={selectedTime}
        onSelectTime={onTimeChange}
      />

      <div className="grid gap-3 rounded-[25px] border border-[#E5E5E5] bg-[#B4B4B4]/35 p-3 sm:grid-cols-3">
        <BookingCounterField
          icon={<CalendarDays className="h-4 w-4" />}
          label={t("booking.dates.nights")}
          value={nights}
          min={1}
          max={30}
          decreaseLabel={t("booking.dates.decreaseNights")}
          increaseLabel={t("booking.dates.increaseNights")}
          onChange={handleNightsChange}
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
        <BookingCounterField
          icon={<BedDouble className="h-4 w-4" />}
          label={t("booking.dates.rooms")}
          value={rooms}
          min={1}
          max={6}
          onChange={onRoomsChange}
        />
      </div>
    </div>
  );
}
