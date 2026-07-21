"use client";

import { BedDouble, Minus, Plus, Users } from "lucide-react";
import { useState } from "react";

import { getDefaultCheckOutDate } from "@/features/travel/booking/booking-params";
import { BookingDateTimePicker } from "@/features/travel/components/booking/booking-date-time-picker";
import {
  getPropertyDayStatuses,
  getPropertyTimeSlots,
  isRangeBlocked,
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

  const handleSelectCheckIn = (dateKey: string) => {
    onCheckInChange(dateKey);
    onCheckOutChange(getDefaultCheckOutDate(dateKey));
  };

  const handleSelectCheckOut = (dateKey: string) => {
    if (isRangeBlocked(dayStatuses, checkIn, dateKey)) {
      return;
    }

    onCheckOutChange(dateKey);
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

      <div className="grid gap-3 rounded-[25px] border border-[#E5E5E5] bg-[#B4B4B4]/35 p-3 sm:grid-cols-2">
        <CounterField
          icon={<Users className="h-4 w-4" />}
          label={t("booking.dates.guests")}
          value={guests}
          min={1}
          max={12}
          onChange={onGuestsChange}
        />
        <CounterField
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
