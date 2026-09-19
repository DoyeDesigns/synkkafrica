"use client";

import type { ReactNode } from "react";
import { BedDouble, Users } from "lucide-react";

import { HeroDateRangeField } from "@/features/travel/components/hero/hero-date-range-field";
import { useTranslation } from "@/hooks/use-translation";

type BookingDatesBarProps = {
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  onCheckInChange: (value: string) => void;
  onCheckOutChange: (value: string) => void;
  onGuestsChange: (value: number) => void;
  onRoomsChange: (value: number) => void;
};

function Field({
  icon,
  label,
  value,
  onChange,
  type = "text",
  min,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  min?: number;
}) {
  return (
    <label className="flex min-w-[140px] flex-1 flex-col gap-1 rounded-[10px] border border-[#E5E5E5] bg-[#F8F8F8] px-3 py-2.5">
      <span className="text-[11px] font-medium font-satoshi text-foreground/60">
        {label}
      </span>
      <span className="flex items-center gap-2">
        <span className="text-[#676565]">{icon}</span>
        <input
          type={type}
          value={value}
          min={min}
          onChange={(event) => onChange(event.target.value)}
          className="w-full bg-transparent text-sm font-medium font-satoshi text-foreground outline-none"
        />
      </span>
    </label>
  );
}

export function BookingDatesBar({
  checkIn,
  checkOut,
  guests,
  rooms,
  onCheckInChange,
  onCheckOutChange,
  onGuestsChange,
  onRoomsChange,
}: BookingDatesBarProps) {
  const t = useTranslation();

  return (
    <div className="grid gap-3 rounded-[25px] border border-[#E5E5E5] bg-[#B4B4B4]/35 p-3 sm:grid-cols-2 xl:grid-cols-4">
      <div className="sm:col-span-2">
        <HeroDateRangeField
          variant="form"
          fromLabel={t("booking.dates.checkIn")}
          toLabel={t("booking.dates.checkOut")}
          addDateLabel={t("hero.common.addDate")}
          fromDate={checkIn}
          toDate={checkOut}
          onFromDateChange={onCheckInChange}
          onToDateChange={onCheckOutChange}
        />
      </div>
      <Field
        icon={<Users className="h-4 w-4" />}
        label={t("booking.dates.guests")}
        value={guests}
        onChange={(value) => onGuestsChange(Number(value) || 1)}
        type="number"
        min={1}
      />
      <Field
        icon={<BedDouble className="h-4 w-4" />}
        label={t("booking.dates.rooms")}
        value={rooms}
        onChange={(value) => onRoomsChange(Number(value) || 1)}
        type="number"
        min={1}
      />
    </div>
  );
}
