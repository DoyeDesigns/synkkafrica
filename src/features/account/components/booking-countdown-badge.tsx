"use client";

import { useEffect, useState } from "react";

import {
  getBookingCountdown,
  type AccountBooking,
} from "@/features/account/data/account-bookings";
import { useTranslation } from "@/hooks/use-translation";

type BookingCountdownBadgeProps = {
  booking: AccountBooking;
  variant?: "card" | "detail";
};

export function BookingCountdownBadge({
  booking,
  variant = "card",
}: BookingCountdownBadgeProps) {
  const t = useTranslation();
  const [countdown, setCountdown] = useState(() => getBookingCountdown(booking));

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCountdown(getBookingCountdown(booking));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [booking]);

  if (!countdown) {
    return null;
  }

  const label =
    countdown.days > 0
      ? t("account.bookings.countdown.daysHours", {
          days: countdown.days,
          hours: countdown.hours,
        })
      : t("account.bookings.countdown.hoursMinutes", {
          hours: countdown.hours,
          minutes: countdown.minutes,
        });

  return (
    <div
      className={`rounded-xl border border-[#FFE6DE] bg-[#FFF1EB] ${
        variant === "detail" ? "px-5 py-4" : "px-3 py-2"
      }`}
    >
      <p className="text-[11px] font-semibold font-satoshi uppercase tracking-wide text-[#D85A30]">
        {t("account.bookings.countdown.label")}
      </p>
      <p
        className={`mt-1 font-bold font-montserrat text-[#004785] ${
          variant === "detail" ? "text-2xl" : "text-sm"
        }`}
      >
        {label}
      </p>
      {variant === "detail" ? (
        <p className="mt-1 text-xs font-medium font-satoshi text-foreground/70">
          {t("account.bookings.countdown.detailHint")}
        </p>
      ) : null}
    </div>
  );
}
