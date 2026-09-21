"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, Plane } from "lucide-react";

import { calculateSyncAfricaFeeDecimal } from "@/features/travel/booking/sync-africa-fee";
import {
  BookingPaymentMethods,
  type CheckoutMethodId,
} from "@/features/travel/components/booking/booking-payment-methods";
import { useTranslation } from "@/hooks/use-translation";
import { priceOffer, type FlightItinerary } from "@/lib/api/flights";

function time(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "--:--"
    : d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}
function day(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString(undefined, {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
}
function money(amount: string, currency: string) {
  const n = Number(amount);
  if (Number.isNaN(n)) return `${currency} ${amount}`;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${currency} ${n.toLocaleString()}`;
  }
}

function Leg({ itinerary }: { itinerary: FlightItinerary }) {
  const segs = itinerary.segments;
  if (!segs.length) return null;
  const first = segs[0];
  const last = segs[segs.length - 1];
  const stops = segs.length - 1;
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EAF2FA] text-[#004785]">
        <Plane className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 text-sm font-semibold font-inter text-foreground">
          <span>{first.departureAirport}</span>
          <span className="text-foreground/40">→</span>
          <span>{last.arrivalAirport}</span>
        </div>
        <div className="text-xs font-satoshi text-foreground/60">
          {day(first.departureAt)} · {time(first.departureAt)}–
          {time(last.arrivalAt)} ·{" "}
          {stops === 0 ? "Non-stop" : `${stops} stop${stops > 1 ? "s" : ""}`}
        </div>
      </div>
    </div>
  );
}

export function FlightBookingSummary({
  offerId,
  adults,
  onPay,
  paying = false,
  disabled = false,
}: {
  offerId: string;
  adults: number;
  onPay?: (method: CheckoutMethodId) => void;
  paying?: false | CheckoutMethodId;
  disabled?: boolean;
}) {
  const t = useTranslation();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["offer-price", offerId],
    queryFn: ({ signal }) => priceOffer(offerId, signal),
    enabled: Boolean(offerId),
    staleTime: 60 * 1000,
    retry: 0,
  });

  const currency = data?.offer.currency ?? "USD";
  const fare = data ? Number(data.offer.totalPrice) : Number.NaN;
  const syncAfricaFee = Number.isFinite(fare)
    ? calculateSyncAfricaFeeDecimal(fare)
    : 0;
  const checkoutTotal = Number.isFinite(fare) ? fare + syncAfricaFee : Number.NaN;

  return (
    <aside className="rounded-xl bg-white p-5">
      <h2 className="text-base font-medium font-satoshi text-foreground">
        Your fare
      </h2>

      <div className="mt-4 overflow-hidden rounded-[10px] border border-[#D9D9D9] bg-white">
        {isLoading ? (
          <div className="flex items-center gap-2 px-4 py-4 text-sm font-satoshi text-foreground/60">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading fare…
          </div>
        ) : isError || !data ? (
          <p className="px-4 py-4 text-sm font-satoshi text-amber-700">
            This fare may have expired. You can still continue — the price is
            re-checked before payment.
          </p>
        ) : (
          <div className="divide-y divide-[#E5E5E5]">
            {data.offer.itineraries.map((it, i) => (
              <Leg key={i} itinerary={it} />
            ))}
          </div>
        )}
      </div>

      <h3 className="mt-5 text-base font-medium font-satoshi text-foreground">
        Price details
      </h3>

      <div className="mt-2 rounded-xl bg-[#FFF1EA] p-4">
        <div className="space-y-2 text-sm font-satoshi">
          <div className="flex items-start justify-between gap-3">
            <span className="text-foreground/80">
              {adults} traveller{adults > 1 ? "s" : ""} ×{" "}
              <span className="font-bold text-foreground">
                {data ? money(data.offer.totalPrice, currency) : "—"}
              </span>
            </span>
            <span className="shrink-0 font-medium text-foreground">
              {data ? money(data.offer.totalPrice, currency) : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-foreground/80">{t("booking.summary.taxesAndFees")}</span>
            <span className="font-medium text-foreground">
              {Number.isFinite(fare) ? money(String(syncAfricaFee), currency) : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-[#F0D4C4] pt-2">
            <span className="font-semibold text-foreground">{t("booking.summary.total")}</span>
            <span className="font-bold text-foreground">
              {Number.isFinite(checkoutTotal)
                ? money(String(checkoutTotal), currency)
                : "—"}
            </span>
          </div>
        </div>
      </div>

      {onPay ? (
        <div className="mt-5">
          <BookingPaymentMethods
            paying={paying}
            disabled={disabled}
            onPay={onPay}
          />
        </div>
      ) : null}

      <p className="mt-3 text-[11px] font-satoshi text-foreground/50">
        Final total incl. taxes &amp; fees is confirmed at payment.
      </p>
    </aside>
  );
}
