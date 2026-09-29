"use client";

import { feeRatePercent } from "@/features/travel/booking/sync-africa-fee";
import { useTranslation } from "@/hooks/use-translation";
import { formatMoney } from "@/lib/format-money";

// What the backend returned when it created the booking — the authoritative
// amounts the customer is charged, in the booking's own currency.
export type BookingChargeBreakdown = {
  bookingId: string;
  currency: string;
  subtotal: number;
  fees: number;
  feeRate?: number;
  total: number;
};

// Normalise a book() response. Older backends returned only `amount`; treat it
// as the total with no separate fee line in that case.
export function toChargeBreakdown(result: {
  bookingId: string;
  amount: number;
  currency: string;
  subtotal?: number;
  fees?: number;
  feeRate?: number;
  total?: number;
}): BookingChargeBreakdown {
  const total = result.total ?? result.amount;
  return {
    bookingId: result.bookingId,
    currency: result.currency,
    subtotal: result.subtotal ?? total,
    fees: result.fees ?? 0,
    feeRate: result.feeRate,
    total,
  };
}

export function BookingPaymentBreakdown({
  breakdown,
}: {
  breakdown: BookingChargeBreakdown;
}) {
  const t = useTranslation();
  const { currency, subtotal, fees, feeRate, total } = breakdown;

  return (
    <div className="mt-4 space-y-2 rounded-lg bg-[#F8F8F8] px-4 py-3 text-sm font-satoshi">
      {fees > 0 ? (
        <>
          <div className="flex items-center justify-between gap-3">
            <span className="font-medium text-[#676565]">
              {t("booking.payment.subtotal")}
            </span>
            <span className="font-medium text-[#2F2F2F]">
              {formatMoney(currency, subtotal)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="font-medium text-[#676565]">
              {t("booking.summary.serviceFee", { rate: feeRatePercent(feeRate) })}
            </span>
            <span className="font-medium text-[#2F2F2F]">
              {formatMoney(currency, fees)}
            </span>
          </div>
        </>
      ) : null}
      <div
        className={`flex items-center justify-between gap-3 ${
          fees > 0 ? "border-t border-[#E5E5E5] pt-2" : ""
        }`}
      >
        <span className="font-medium text-[#676565]">
          {t("booking.summary.total")}
        </span>
        <span className="text-lg font-bold text-[#D85A30]">
          {formatMoney(currency, total)}
        </span>
      </div>
    </div>
  );
}
