"use client";

import { CalendarDays } from "lucide-react";
import { useState } from "react";

import { getDefaultCheckInDate } from "@/features/travel/booking/booking-params";
import { BookingCounterField } from "@/features/travel/components/booking/booking-counter-field";
import { BookingDateTimePicker } from "@/features/travel/components/booking/booking-date-time-picker";
import {
  getPropertyTimeSlots,
  getTourDayStatuses,
} from "@/features/travel/data/property-availability";
import { useTranslation } from "@/hooks/use-translation";

type CarDatesSectionProps = {
  carId: string;
  pickupDate: string;
  days: number;
  selectedTime: string;
  onPickupDateChange: (value: string) => void;
  onDaysChange: (value: number) => void;
  onTimeChange: (value: string) => void;
};

export function CarDatesSection({
  carId,
  pickupDate,
  days,
  selectedTime,
  onPickupDateChange,
  onDaysChange,
  onTimeChange,
}: CarDatesSectionProps) {
  const t = useTranslation();
  const [viewDate, setViewDate] = useState(
    () => new Date(pickupDate || getDefaultCheckInDate()),
  );
  const dayStatuses = getTourDayStatuses(carId);
  const timeSlots = getPropertyTimeSlots();

  return (
    <div className="space-y-4">
      <BookingDateTimePicker
        mode="single"
        viewDate={viewDate}
        onViewDateChange={setViewDate}
        blockedDates={dayStatuses}
        checkIn={null}
        checkOut={null}
        selectedDate={pickupDate}
        onSelectCheckIn={() => undefined}
        onSelectCheckOut={() => undefined}
        onSelectDate={onPickupDateChange}
        timeSlots={timeSlots}
        selectedTime={selectedTime}
        onSelectTime={onTimeChange}
      />

      <div className="rounded-[25px] border border-[#E5E5E5] bg-[#B4B4B4]/35 p-3">
        <BookingCounterField
          icon={<CalendarDays className="h-4 w-4" />}
          label={t("booking.dates.rentalDays")}
          value={days}
          min={1}
          max={30}
          decreaseLabel={t("booking.dates.decreaseDays")}
          increaseLabel={t("booking.dates.increaseDays")}
          onChange={onDaysChange}
        />
      </div>
    </div>
  );
}
