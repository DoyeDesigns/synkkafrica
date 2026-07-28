"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { getPopularFares, type PopularFare } from "@/lib/api/flights";
import { FlightDealCard } from "@/features/travel/components/landing/flights/flight-deals-section";

const REGION_ORDER = ["Africa", "Europe", "Asia", "North America"];
const REGION_TITLES: Record<string, string> = {
  Africa: "African destinations",
  Europe: "European destinations",
  Asia: "Asian destinations",
  "North America": "North American destinations",
};

export default function FlightDealsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["popular-fares"],
    queryFn: ({ signal }) => getPopularFares(signal),
    staleTime: 10 * 60 * 1000,
  });

  const date = data?.sampledDate ?? "";
  const deals = (data?.fares ?? []).filter((f) => f.price && f.currency);

  const byRegion = new Map<string, PopularFare[]>();
  for (const fare of deals) {
    const list = byRegion.get(fare.region) ?? [];
    list.push(fare);
    byRegion.set(fare.region, list);
  }
  // Any regions the backend returns that aren't in our preferred order.
  const extraRegions = [...byRegion.keys()].filter(
    (r) => !REGION_ORDER.includes(r),
  );
  const regions = [...REGION_ORDER, ...extraRegions].filter((r) =>
    byRegion.has(r),
  );

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mt-15">
          <Link
            href="/?section=flights"
            className="inline-flex items-center gap-1.5 text-sm font-medium font-satoshi text-[#004785] transition-opacity hover:opacity-80"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to flights
          </Link>

          <h1 className="mt-4 text-2xl font-bold font-montserrat text-[#1E1E1E] sm:text-[28px]">
            Flight deals from Lagos
          </h1>
          <p className="mt-1 text-sm font-satoshi text-foreground/70">
            Live one-way fares, refreshed hourly.
            {date ? ` Sample date ${date}.` : ""}
          </p>
        </div>

        {isLoading ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="h-40 w-full animate-pulse rounded-2xl bg-black/10"
              />
            ))}
          </div>
        ) : deals.length === 0 ? (
          <div className="mt-16 rounded-2xl border border-black/10 bg-white p-12 text-center text-foreground/60">
            No live fares right now. Please check back shortly.
          </div>
        ) : (
          <div className="mt-10 space-y-10 pb-16">
            {regions.map((region) => (
              <section key={region}>
                <h2 className="text-base font-bold font-montserrat text-[#1E1E1E]">
                  {REGION_TITLES[region] ?? region}
                </h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {(byRegion.get(region) ?? []).map((fare) => (
                    <FlightDealCard
                      key={fare.destination}
                      fare={fare}
                      date={date}
                      className="h-40 w-full"
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
