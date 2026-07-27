"use client";

import { CalendarDays } from "lucide-react";

import { BookingCounterField } from "@/features/travel/components/booking/booking-counter-field";
import { useTranslation } from "@/hooks/use-translation";

type TourPackageDatesSectionProps = {
  days: number;
  onDaysChange: (value: number) => void;
  minDays?: number;
  maxDays?: number;
};

export function TourPackageDatesSection({
  days,
  onDaysChange,
  minDays = 1,
  maxDays = 21,
}: TourPackageDatesSectionProps) {
  const t = useTranslation();

  return (
    <section className="rounded-[10px] bg-white p-5">
      <h2 className="text-base font-semibold font-inter text-foreground">
        {t("booking.dates.tripDuration")}
      </h2>
      <p className="mt-1 text-sm font-normal font-inter text-foreground/70">
        {t("booking.dates.tripDurationHint")}
      </p>

      <div className="mt-4 rounded-[25px] border border-[#E5E5E5] bg-[#B4B4B4]/35 p-3">
        <BookingCounterField
          icon={<CalendarDays className="h-4 w-4" />}
          label={t("booking.dates.days")}
          value={days}
          min={minDays}
          max={maxDays}
          decreaseLabel={t("booking.dates.decreaseDays")}
          increaseLabel={t("booking.dates.increaseDays")}
          onChange={onDaysChange}
        />
      </div>
    </section>
  );
}
