"use client";

import Link from "next/link";
import { CalendarPlus, Copy } from "lucide-react";
import { useState } from "react";

import {
  buildGoogleCalendarUrl,
  downloadIcsFile,
  type StoredBookingConfirmation,
} from "@/features/travel/booking/booking-confirmation";
import { useFormatPrice } from "@/hooks/use-format-price";
import { useTranslation } from "@/hooks/use-translation";

type BookingConfirmationDetailsProps = {
  confirmation: StoredBookingConfirmation;
};

export function BookingConfirmationDetails({
  confirmation,
}: BookingConfirmationDetailsProps) {
  const t = useTranslation();
  const formatPrice = useFormatPrice();
  const [copied, setCopied] = useState(false);

  const handleCopyReference = async () => {
    await navigator.clipboard.writeText(confirmation.reference);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-8 w-full max-w-xl space-y-4">
      <div className="rounded-xl border border-[#E5E5E5] bg-white p-5 text-left">
        <p className="text-xs font-semibold font-satoshi uppercase tracking-wide text-[#676565]">
          {t("booking.confirmation.referenceLabel")}
        </p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-xl font-bold font-montserrat text-[#004785]">
            {confirmation.reference}
          </p>
          <button
            type="button"
            onClick={handleCopyReference}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#E5E5E5] px-3 py-1.5 text-xs font-medium font-satoshi text-foreground transition-colors hover:bg-[#F8F8F8]"
          >
            <Copy className="h-3.5 w-3.5" />
            {copied ? t("booking.confirmation.copied") : t("booking.confirmation.copyReference")}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-[#E5E5E5] bg-white p-5 text-left">
        <h3 className="text-sm font-semibold font-inter text-foreground">
          {t("booking.confirmation.summaryTitle")}
        </h3>
        <dl className="mt-3 space-y-2 text-sm font-satoshi">
          <div className="flex justify-between gap-3">
            <dt className="text-foreground/70">{t("booking.confirmation.product")}</dt>
            <dd className="font-medium text-foreground">{confirmation.productName}</dd>
          </div>
          {confirmation.checkIn ? (
            <div className="flex justify-between gap-3">
              <dt className="text-foreground/70">{t("booking.dates.checkIn")}</dt>
              <dd className="font-medium text-foreground">{confirmation.checkIn}</dd>
            </div>
          ) : null}
          {confirmation.checkOut ? (
            <div className="flex justify-between gap-3">
              <dt className="text-foreground/70">{t("booking.dates.checkOut")}</dt>
              <dd className="font-medium text-foreground">{confirmation.checkOut}</dd>
            </div>
          ) : null}
          {confirmation.date ? (
            <div className="flex justify-between gap-3">
              <dt className="text-foreground/70">{t("booking.dateTime.experienceDate")}</dt>
              <dd className="font-medium text-foreground">{confirmation.date}</dd>
            </div>
          ) : null}
          {confirmation.time ? (
            <div className="flex justify-between gap-3">
              <dt className="text-foreground/70">{t("booking.dateTime.timeSlots")}</dt>
              <dd className="font-medium text-foreground">{confirmation.time}</dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-3">
            <dt className="text-foreground/70">{t("booking.dates.guests")}</dt>
            <dd className="font-medium text-foreground">{confirmation.guests}</dd>
          </div>
          {confirmation.total && confirmation.currency ? (
            <div className="flex justify-between gap-3 border-t border-[#E5E5E5] pt-2">
              <dt className="font-semibold text-foreground">{t("booking.confirmation.totalPaid")}</dt>
              <dd className="font-bold text-[#D85A30]">
                {formatPrice(confirmation.currency, confirmation.total)}
              </dd>
            </div>
          ) : null}
        </dl>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => downloadIcsFile(confirmation)}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-[#004785] bg-white px-4 py-3 text-sm font-semibold font-montserrat text-[#004785] transition-colors hover:bg-[#F0F6FB]"
        >
          <CalendarPlus className="h-4 w-4" />
          {t("booking.confirmation.addToCalendar")}
        </button>
        <a
          href={buildGoogleCalendarUrl(confirmation)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 items-center justify-center rounded-md border border-[#E5E5E5] bg-white px-4 py-3 text-sm font-semibold font-montserrat text-foreground transition-colors hover:bg-[#F8F8F8]"
        >
          {t("booking.confirmation.openGoogleCalendar")}
        </a>
      </div>

      <Link
        href="/account/bookings"
        className="inline-flex w-full items-center justify-center rounded-md bg-[#D85A30] px-4 py-3 text-sm font-bold font-montserrat uppercase tracking-wide text-white transition-opacity hover:opacity-90"
      >
        {t("booking.confirmation.viewBookings")}
      </Link>
    </div>
  );
}
