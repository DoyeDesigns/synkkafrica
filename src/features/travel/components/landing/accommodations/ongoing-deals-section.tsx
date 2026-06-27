"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { TRAVEL_CAROUSEL_SCROLL_CLASS } from "@/features/travel/constants";
import type { AccommodationDeal } from "@/features/travel/data/accommodations-landing";
import { useTranslation } from "@/hooks/use-translation";
import { OngoingDealCard } from "../ongoing-deal-card";

type OngoingDealsSectionProps = {
  items: AccommodationDeal[];
  seeMoreHref?: string;
};

export function OngoingDealsSection({
  items,
  seeMoreHref = "/?section=accommodations&view=results",
}: OngoingDealsSectionProps) {
  const t = useTranslation();

  return (
    <section className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-bold font-montserrat text-[#1E1E1E]">
            {t("landing.ongoingDeals.title")}
          </h2>
          <p className="mt-0.5 font-medium font-satoshi text-foreground">
            {t("landing.ongoingDeals.description")}
          </p>
        </div>

        <Link
          href={seeMoreHref}
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:opacity-80"
        >
          {t("common.seeMore")}
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-white">
            <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      </div>

      <div className={`flex gap-5 overflow-x-auto pb-2 ${TRAVEL_CAROUSEL_SCROLL_CLASS}`}>
        {items.map((item) => (
          <OngoingDealCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
