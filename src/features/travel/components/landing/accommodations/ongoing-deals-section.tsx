"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import type { AccommodationDeal } from "@/features/travel/data/accommodations-landing";
import { useTranslation } from "@/hooks/use-translation";
import { listPackages, toAccommodationDeal } from "@/lib/api/packages";
import { InfiniteMarquee } from "../infinite-marquee";
import { OngoingDealCard } from "../ongoing-deal-card";

type OngoingDealsSectionProps = {
  // Kept for call-site compatibility; live published packages are the source.
  items?: AccommodationDeal[];
  seeMoreHref?: string;
};

export function OngoingDealsSection({
  seeMoreHref = "/tour-packages",
}: OngoingDealsSectionProps) {
  const t = useTranslation();
  const { data } = useQuery({
    queryKey: ["packages"],
    queryFn: listPackages,
    refetchOnWindowFocus: false,
  });
  const items = (data ?? []).map(toAccommodationDeal);

  // No published packages → hide the section (no empty carousel).
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-[22px] font-bold font-montserrat text-[#1E1E1E]">
            {t("landing.packages.title")}
          </h2>
          <p className="mt-0.5 font-medium font-satoshi text-foreground">
            {t("landing.ongoingDeals.description")}
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

      <InfiniteMarquee itemCount={items.length} className="-mx-4 sm:mx-0">
        {[...items, ...items].map((item, index) => (
          <OngoingDealCard key={`${item.id}-${index}`} item={item} />
        ))}
      </InfiniteMarquee>
    </section>
  );
}
