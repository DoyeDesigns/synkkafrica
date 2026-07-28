"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { getPopularFares, type PopularFare } from "@/lib/api/flights";

const REGION_ORDER = ["Africa", "Europe", "Asia", "North America"];
const REGION_TITLES: Record<string, string> = {
  Africa: "African Flights",
  Europe: "European Flights",
  Asia: "Asian Flights",
  "North America": "North American Flights",
};

function formatMoney(price: string, currency: string): string {
  const n = Number(price);
  if (Number.isNaN(n)) return `${currency} ${price}`;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${currency} ${Math.round(n).toLocaleString()}`;
  }
}

function FareRow({ fare, date }: { fare: PopularFare; date: string }) {
  const href =
    `/?section=flights&view=results&tripType=one-way` +
    `&from=${fare.origin}&to=${fare.destination}` +
    `&departureDate=${date}&passengers=1&cabinClass=economy`;

  return (
    <li>
      <Link
        href={href}
        className="group flex items-baseline justify-between gap-2 text-sm text-foreground/70 hover:text-[#004785]"
      >
        <span className="group-hover:underline">Flights to {fare.city}</span>
        {fare.price && fare.currency ? (
          <span className="shrink-0 text-xs font-semibold text-[#004785]">
            from {formatMoney(fare.price, fare.currency)}
          </span>
        ) : null}
      </Link>
    </li>
  );
}

function HotelColumn({ title, cities }: { title: string; cities: string[] }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-[#1E1E1E]">{title}</h3>
      <ul className="mt-3 space-y-2">
        {cities.map((city) => (
          <li key={city}>
            <span className="text-sm text-foreground/70">Hotels in {city}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CheapFlightsSection() {
  // One cached call powers the whole flights block.
  const { data, isLoading } = useQuery({
    queryKey: ["popular-fares"],
    queryFn: ({ signal }) => getPopularFares(signal),
    staleTime: 10 * 60 * 1000,
  });

  const date = data?.sampledDate ?? "";
  const byRegion = new Map<string, PopularFare[]>();
  for (const fare of data?.fares ?? []) {
    const list = byRegion.get(fare.region) ?? [];
    list.push(fare);
    byRegion.set(fare.region, list);
  }

  return (
    <section className="bg-[#EAF1F8] py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-base font-bold text-[#1E1E1E]">
            Cheap flights from Nigeria
          </h2>
          {date ? (
            <span className="text-xs text-foreground/50">
              Live fares from Lagos (LOS) · sample date {date}
            </span>
          ) : null}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
          {REGION_ORDER.map((region) => (
            <div key={region}>
              <h3 className="text-sm font-bold text-[#1E1E1E]">
                {REGION_TITLES[region] ?? region}
              </h3>
              <ul className="mt-3 space-y-2">
                {isLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <li
                        key={i}
                        className="h-4 w-32 animate-pulse rounded bg-black/10"
                      />
                    ))
                  : (byRegion.get(region) ?? []).map((fare) => (
                      <FareRow key={fare.destination} fare={fare} date={date} />
                    ))}
              </ul>
            </div>
          ))}
        </div>

        <h2 className="mt-12 text-base font-bold text-[#1E1E1E]">
          Book Cheap Hotels
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
          <HotelColumn
            title="African Hotels"
            cities={["Accra", "Nairobi", "Cape Town", "Johannesburg"]}
          />
          <HotelColumn
            title="European Hotels"
            cities={["London", "Istanbul", "Manchester", "Paris"]}
          />
          <HotelColumn
            title="Asian Hotels"
            cities={["Dubai", "Abu Dhabi", "Guangzhou", "New Delhi"]}
          />
          <HotelColumn
            title="North American Hotels"
            cities={["Atlanta", "Toronto", "Houston", "New York"]}
          />
        </div>
      </div>
    </section>
  );
}
