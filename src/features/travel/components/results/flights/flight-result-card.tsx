"use client";

import Link from "next/link";
import { Clock } from "lucide-react";

import type { FlightItinerary, FlightOffer } from "@/lib/api/flights";

// IATA airline code → display name. Falls back to the code. ZZ is Duffel's
// test airline; the rest cover the carriers Duffel surfaces for this product.
const AIRLINES: Record<string, string> = {
  ZZ: "Duffel Airways",
  BA: "British Airways",
  VS: "Virgin Atlantic",
  AF: "Air France",
  KL: "KLM",
  LH: "Lufthansa",
  EK: "Emirates",
  QR: "Qatar Airways",
  TK: "Turkish Airlines",
  ET: "Ethiopian Airlines",
  KQ: "Kenya Airways",
  WB: "RwandAir",
  SA: "South African Airways",
  MS: "EgyptAir",
  AT: "Royal Air Maroc",
  DL: "Delta Air Lines",
  UA: "United Airlines",
  AA: "American Airlines",
  AC: "Air Canada",
};
const airlineName = (code: string) => AIRLINES[code] ?? code;

function formatTime(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "--:--"
    : d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}
function formatDate(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString(undefined, {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
}
function legDuration(it: FlightItinerary) {
  const segs = it.segments;
  if (!segs.length) return "";
  const dep = new Date(segs[0].departureAt).getTime();
  const arr = new Date(segs[segs.length - 1].arrivalAt).getTime();
  if (Number.isNaN(dep) || Number.isNaN(arr) || arr <= dep) return "";
  const mins = Math.round((arr - dep) / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return [h ? `${h}h` : "", m ? `${m}m` : ""].filter(Boolean).join(" ");
}
function money(amount: string, currency: string) {
  const n = Number(amount);
  if (Number.isNaN(n)) return `${amount} ${currency}`;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${currency} ${Math.round(n)}`;
  }
}

function AirlineBadge({ code }: { code: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EAF2FA] text-xs font-bold text-[#004785]">
        {code}
      </div>
      <span className="text-sm font-medium text-foreground">
        {airlineName(code)}
      </span>
    </div>
  );
}

function Leg({ itinerary }: { itinerary: FlightItinerary }) {
  const segs = itinerary.segments;
  if (!segs.length) return null;
  const first = segs[0];
  const last = segs[segs.length - 1];
  const stops = segs.length - 1;

  return (
    <div className="flex items-center gap-4">
      <div className="w-16 shrink-0 text-right">
        <div className="text-lg font-bold leading-tight text-foreground">
          {formatTime(first.departureAt)}
        </div>
        <div className="text-xs font-medium text-foreground/50">
          {first.departureAirport}
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center">
        <span className="text-[11px] text-foreground/50">
          {legDuration(itinerary)}
        </span>
        <div className="relative my-1 h-[2px] w-full rounded bg-[#E3E3E3]">
          <span className="absolute -left-[3px] -top-[3px] h-2 w-2 rounded-full bg-[#004785]" />
          {stops > 0 ? (
            <span className="absolute left-1/2 -top-[3px] h-2 w-2 -translate-x-1/2 rounded-full bg-[#e45d25]" />
          ) : null}
          <span className="absolute -right-[3px] -top-[3px] h-2 w-2 rounded-full bg-[#004785]" />
        </div>
        <span className="text-[11px] font-medium text-foreground/60">
          {stops === 0 ? "Non-stop" : `${stops} stop${stops > 1 ? "s" : ""}`}
        </span>
      </div>

      <div className="w-16 shrink-0">
        <div className="text-lg font-bold leading-tight text-foreground">
          {formatTime(last.arrivalAt)}
        </div>
        <div className="text-xs font-medium text-foreground/50">
          {last.arrivalAirport}
        </div>
      </div>
    </div>
  );
}

export function FlightResultCard({
  offer,
  adults,
}: {
  offer: FlightOffer;
  adults: number;
}) {
  const carrier = offer.itineraries[0]?.segments[0]?.carrierCode ?? "";
  const depDate = offer.itineraries[0]?.segments[0]?.departureAt;

  return (
    <article className="overflow-hidden rounded-xl border border-black/10 bg-white transition-shadow hover:shadow-md">
      <div className="flex flex-col lg:flex-row">
        <div className="flex-1 p-5">
          <div className="mb-3 flex items-center justify-between">
            <AirlineBadge code={carrier} />
            {depDate ? (
              <span className="text-xs text-foreground/50">
                {formatDate(depDate)}
              </span>
            ) : null}
          </div>

          <div className="space-y-3">
            {offer.itineraries.map((it, i) => (
              <Leg key={i} itinerary={it} />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-black/10 bg-[#FAFAFA] p-5 lg:w-56 lg:flex-col lg:items-stretch lg:justify-center lg:border-l lg:border-t-0">
          <div className="lg:text-right">
            <div className="text-2xl font-bold text-foreground">
              {money(offer.totalPrice, offer.currency)}
            </div>
            <div className="text-[11px] text-foreground/50">
              total{adults > 1 ? ` · ${adults} pax` : ""}
            </div>
            {offer.holdAvailable ? (
              <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                <Clock className="h-3 w-3" /> Hold available
              </div>
            ) : null}
          </div>

          <Link
            href={`/flights/book?offerId=${encodeURIComponent(offer.id)}&adults=${adults}`}
            className="flex h-11 shrink-0 items-center justify-center rounded-lg bg-[#e45d25] px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90 lg:mt-3"
          >
            Select
          </Link>
        </div>
      </div>
    </article>
  );
}
