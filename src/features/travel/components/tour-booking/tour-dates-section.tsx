"use client";

import { Minus, Plus, Users } from "lucide-react";
import { useState } from "react";

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
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  onGuestsChange: (value: number) => void;
};

export function TourDatesSection({
  tourId,
  selectedDate,
  selectedTime,
  guests,
  onDateChange,
  onTimeChange,
  onGuestsChange,
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

      <div className="rounded-[25px] border border-[#E5E5E5] bg-[#B4B4B4]/35 p-3">
        <CounterField
          icon={<Users className="h-4 w-4" />}
          label={t("booking.dates.guests")}
          value={guests}
          min={1}
          max={12}
          onChange={onGuestsChange}
        />
      </div>
    </div>
  );
}

function CounterField({
  icon,
  label,
  value,
  min,
  max,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex min-w-[140px] flex-1 items-center justify-between gap-3 rounded-[10px] border border-[#E5E5E5] bg-[#F8F8F8] px-3 py-2.5">
      <div>
        <p className="text-[11px] font-medium font-satoshi text-foreground/60">
          {label}
        </p>
        <p className="mt-1 flex items-center gap-2 text-sm font-medium font-satoshi text-foreground">
          <span className="text-[#676565]">{icon}</span>
          {value}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="rounded-md border border-[#E5E5E5] bg-white p-1 text-[#676565]"
          aria-label={`Decrease ${label}`}
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          className="rounded-md border border-[#E5E5E5] bg-white p-1 text-[#676565]"
          aria-label={`Increase ${label}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
