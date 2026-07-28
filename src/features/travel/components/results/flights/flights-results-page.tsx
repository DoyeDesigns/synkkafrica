"use client";

import { useMemo, useState } from "react";
import { AlertCircle, Loader2, PlaneTakeoff } from "lucide-react";

import { FlightResultCard } from "@/features/travel/components/results/flights/flight-result-card";
import { useFlightSearch } from "@/features/travel/hooks/use-flight-search";
import { useTravelNavigation } from "@/features/travel/hooks/use-travel-navigation";
import type { FlightOffer } from "@/lib/api/flights";

type Sort = "cheapest" | "fastest" | "best";

type OfferMeta = {
  offer: FlightOffer;
  price: number;
  durationMin: number;
  stops: number; // max across itineraries
  carriers: string[];
};

function meta(offer: FlightOffer): OfferMeta {
  let durationMin = 0;
  let stops = 0;
  const carriers = new Set<string>();
  for (const it of offer.itineraries) {
    const segs = it.segments;
    if (!segs.length) continue;
    stops = Math.max(stops, segs.length - 1);
    const dep = new Date(segs[0].departureAt).getTime();
    const arr = new Date(segs[segs.length - 1].arrivalAt).getTime();
    if (!Number.isNaN(dep) && !Number.isNaN(arr) && arr > dep) {
      durationMin += (arr - dep) / 60000;
    }
    segs.forEach((s) => carriers.add(s.carrierCode));
  }
  return {
    offer,
    price: Number(offer.totalPrice) || 0,
    durationMin,
    stops,
    carriers: [...carriers],
  };
}

const STOP_BUCKETS = [
  { key: "0", label: "Non-stop" },
  { key: "1", label: "1 stop" },
  { key: "2", label: "2+ stops" },
] as const;

function bucketOf(stops: number) {
  return stops <= 0 ? "0" : stops === 1 ? "1" : "2";
}

export function FlightsResultsPage() {
  const { resetToLanding } = useTravelNavigation();
  const { data, isLoading, isError, error, input, isValid } = useFlightSearch();

  const all = useMemo(() => (data?.items ?? []).map(meta), [data]);

  const [sort, setSort] = useState<Sort>("cheapest");
  const [stopFilter, setStopFilter] = useState<Set<string>>(new Set());
  const [airlineFilter, setAirlineFilter] = useState<Set<string>>(new Set());
  const [maxPrice, setMaxPrice] = useState<number | null>(null);

  const airlines = useMemo(() => {
    const s = new Set<string>();
    all.forEach((m) => m.carriers.forEach((c) => s.add(c)));
    return [...s].sort();
  }, [all]);

  const priceBounds = useMemo(() => {
    if (!all.length) return null;
    const prices = all.map((m) => m.price);
    return { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) };
  }, [all]);

  const currency = data?.items[0]?.currency ?? "USD";

  const filtered = useMemo(() => {
    let list = all;
    if (stopFilter.size)
      list = list.filter((m) => stopFilter.has(bucketOf(m.stops)));
    if (airlineFilter.size)
      list = list.filter((m) => m.carriers.some((c) => airlineFilter.has(c)));
    if (maxPrice != null) list = list.filter((m) => m.price <= maxPrice);

    const sorted = [...list];
    if (sort === "cheapest") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "fastest")
      sorted.sort((a, b) => a.durationMin - b.durationMin);
    else
      sorted.sort(
        (a, b) => a.price + a.durationMin / 30 - (b.price + b.durationMin / 30),
      );
    return sorted;
  }, [all, stopFilter, airlineFilter, maxPrice, sort]);

  const toggle = (set: Set<string>, key: string) => {
    const next = new Set(set);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    return next;
  };

  const cheapestBy = (fn: (m: OfferMeta) => boolean) => {
    const m = all.filter(fn);
    return m.length ? Math.min(...m.map((x) => x.price)) : null;
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {input.origin && input.destination
              ? `${input.origin} → ${input.destination}`
              : "Flight results"}
          </h1>
          {isValid ? (
            <p className="text-sm text-foreground/60">
              {input.departureDate}
              {input.returnDate ? ` – ${input.returnDate}` : ""} ·{" "}
              {input.adults} passenger{input.adults > 1 ? "s" : ""} ·{" "}
              {input.cabin?.toLowerCase().replace("_", " ")}
              {data ? ` · ${filtered.length} of ${data.total}` : ""}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={resetToLanding}
          className="text-sm font-medium text-[#004785] hover:underline"
        >
          New search
        </button>
      </div>

      {!isValid ? (
        <EmptyState
          icon={<PlaneTakeoff className="h-6 w-6" />}
          title="Enter your trip details"
          body="Add a departure and destination airport (3-letter code, e.g. LOS, LHR) and a date to search live fares."
        />
      ) : isLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white p-12 text-foreground/60">
          <Loader2 className="h-5 w-5 animate-spin" />
          Searching live fares…
        </div>
      ) : isError ? (
        <EmptyState
          icon={<AlertCircle className="h-6 w-6 text-red-500" />}
          title="Couldn’t load flights"
          body={error instanceof Error ? error.message : "Please try again."}
        />
      ) : all.length === 0 ? (
        <EmptyState
          icon={<PlaneTakeoff className="h-6 w-6" />}
          title="No flights found"
          body="No offers matched this route and date. Try different airports or dates."
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          {/* Filters */}
          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <FilterGroup title="Stops">
              {STOP_BUCKETS.map((b) => {
                const from = cheapestBy((m) => bucketOf(m.stops) === b.key);
                if (from == null) return null;
                return (
                  <Check
                    key={b.key}
                    label={b.label}
                    hint={`from ${money(from, currency)}`}
                    checked={stopFilter.has(b.key)}
                    onChange={() => setStopFilter((s) => toggle(s, b.key))}
                  />
                );
              })}
            </FilterGroup>

            {airlines.length > 1 ? (
              <FilterGroup title="Airlines">
                {airlines.map((code) => (
                  <Check
                    key={code}
                    label={code}
                    checked={airlineFilter.has(code)}
                    onChange={() => setAirlineFilter((s) => toggle(s, code))}
                  />
                ))}
              </FilterGroup>
            ) : null}

            {priceBounds && priceBounds.max > priceBounds.min ? (
              <FilterGroup title="Max price">
                <input
                  type="range"
                  min={priceBounds.min}
                  max={priceBounds.max}
                  value={maxPrice ?? priceBounds.max}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#004785]"
                />
                <p className="text-xs text-foreground/60">
                  Up to {money(maxPrice ?? priceBounds.max, currency)}
                </p>
              </FilterGroup>
            ) : null}
          </aside>

          {/* Sort + list */}
          <div className="space-y-4">
            <div className="flex overflow-hidden rounded-xl border border-black/10 bg-white">
              {(
                [
                  ["cheapest", "Cheapest"],
                  ["fastest", "Fastest"],
                  ["best", "Best"],
                ] as Array<[Sort, string]>
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSort(key)}
                  className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
                    sort === key
                      ? "border-b-2 border-[#004785] text-[#004785]"
                      : "text-foreground/60 hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                icon={<PlaneTakeoff className="h-6 w-6" />}
                title="No flights match your filters"
                body="Try loosening the stops, airline, or price filters."
              />
            ) : (
              filtered.map((m) => (
                <FlightResultCard
                  key={m.offer.id}
                  offer={m.offer}
                  adults={input.adults}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function money(n: number, currency: string) {
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

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-4">
      <h3 className="mb-3 text-sm font-bold text-foreground">{title}</h3>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function Check({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-2 text-sm">
      <span className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="h-4 w-4 rounded accent-[#004785]"
        />
        <span className="text-foreground/80">{label}</span>
      </span>
      {hint ? <span className="text-xs text-foreground/50">{hint}</span> : null}
    </label>
  );
}

function EmptyState({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-black/10 bg-white p-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EAF2FA] text-[#004785]">
        {icon}
      </div>
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <p className="max-w-md text-sm text-foreground/60">{body}</p>
    </div>
  );
}
