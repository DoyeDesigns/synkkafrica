"use client";

import { CalendarDays, Clock } from "lucide-react";
import { useState } from "react";

import { BookingCounterField } from "@/features/travel/components/booking/booking-counter-field";
import { BookingDateTimePicker } from "@/features/travel/components/booking/booking-date-time-picker";
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
  pickupDate,
  days,
  selectedTime,
  onPickupDateChange,
  onDaysChange,
  onTimeChange,
}: CarDatesSectionProps) {
  const t = useTranslation();
  const [viewDate, setViewDate] = useState(() => new Date());

  return (
    <div className="space-y-4">
      <BookingDateTimePicker
        mode="single"
        viewDate={viewDate}
        onViewDateChange={setViewDate}
        checkIn={null}
        checkOut={null}
        selectedDate={pickupDate}
        onSelectCheckIn={() => undefined}
        onSelectCheckOut={() => undefined}
        onSelectDate={onPickupDateChange}
        timeSlots={[]}
        selectedTime={selectedTime}
        onSelectTime={onTimeChange}
        showTimeSlots={false}
      />

      <label className="flex flex-col gap-2 rounded-[10px] border border-[#E5E5E5] bg-white p-5">
        <span className="inline-flex items-center gap-2 text-sm font-semibold font-inter text-foreground">
          <Clock className="h-4 w-4 text-[#004785]" strokeWidth={1.75} />
          {t("booking.dateTime.arrivalTime")}
        </span>
        <span className="text-xs font-medium font-inter text-foreground/70">
          {t("booking.dateTime.arrivalTimeHint")}
        </span>
        <input
          type="time"
          required
          value={selectedTime}
          onChange={(event) => onTimeChange(event.target.value)}
          className="h-11 max-w-xs rounded-md border border-[#E5E5E5] bg-white px-3 text-sm font-medium font-satoshi text-foreground outline-none focus:border-[#004785]"
        />
      </label>

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
