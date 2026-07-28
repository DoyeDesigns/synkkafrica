"use client";

import { ArrowRight, Plane } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { getPopularFares, type PopularFare } from "@/lib/api/flights";
import { useTranslation } from "@/hooks/use-translation";
import { InfiniteMarquee } from "../infinite-marquee";

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

export function dealHref(fare: PopularFare, date: string): string {
  const dep = date || new Date().toISOString().slice(0, 10);
  return (
    `/?section=flights&view=results&tripType=one-way` +
    `&from=${fare.origin}&to=${fare.destination}` +
    `&departureDate=${dep}&passengers=1&cabinClass=economy`
  );
}

export function FlightDealCard({
  fare,
  date,
  className = "h-40 w-64 shrink-0",
}: {
  fare: PopularFare;
  date: string;
  className?: string;
}) {
  return (
    <Link
      href={dealHref(fare, date)}
      className={`group relative flex ${className} flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-[#004785] to-[#012e57] p-5 text-white transition-transform hover:-translate-y-0.5`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/5"
      />
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold font-satoshi">
          One-way
        </span>
        <Plane className="h-4 w-4 text-white/70" />
      </div>

      <div>
        <div className="flex items-center gap-2 text-lg font-bold font-montserrat">
          <span>{fare.origin}</span>
          <span className="text-white/50">→</span>
          <span>{fare.destination}</span>
        </div>
        <p className="mt-0.5 text-sm font-satoshi text-white/70">{fare.city}</p>
      </div>

      <div className="flex items-center justify-between">
        {fare.price && fare.currency ? (
          <span className="text-sm font-satoshi text-white/70">
            from{" "}
            <span className="text-base font-bold text-white">
              {formatMoney(fare.price, fare.currency)}
            </span>
          </span>
        ) : (
          <span className="text-sm font-satoshi text-white/70">See fares</span>
        )}
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#D85A30] text-white transition-transform group-hover:translate-x-0.5">
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="h-40 w-64 shrink-0 animate-pulse rounded-2xl bg-black/10" />
  );
}

export function FlightDealsSection({
  seeMoreHref = "/flights/deals",
}: {
  seeMoreHref?: string;
}) {
  const t = useTranslation();

  // Same query key as CheapFlightsSection → one cached request powers both.
  const { data, isLoading } = useQuery({
    queryKey: ["popular-fares"],
    queryFn: ({ signal }) => getPopularFares(signal),
    staleTime: 10 * 60 * 1000,
  });

  const date = data?.sampledDate ?? "";
  const deals = (data?.fares ?? []).filter((f) => f.price && f.currency);

  // Nothing priced and not loading → hide the section rather than show an
  // empty marquee.
  if (!isLoading && deals.length === 0) {
    return null;
  }

  return (
    <section className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-[22px] font-bold font-montserrat text-[#1E1E1E]">
            {t("landing.ongoingDeals.title")}
          </h2>
          <p className="mt-0.5 font-medium font-satoshi text-foreground">
            Live one-way fares from Lagos, refreshed hourly
          </p>
        </div>

        <Link
          href={seeMoreHref}
          className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-foreground hover:opacity-80"
        >
          {t("common.seeMore")}
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-white">
            <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      </div>

      {isLoading ? (
        <div className="-mx-4 flex gap-5 overflow-hidden px-4 sm:mx-0 sm:px-0">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <InfiniteMarquee itemCount={deals.length} className="-mx-4 sm:mx-0">
          {[...deals, ...deals].map((fare, index) => (
            <FlightDealCard
              key={`${fare.destination}-${index}`}
              fare={fare}
              date={date}
            />
          ))}
        </InfiniteMarquee>
      )}
    </section>
  );
}
