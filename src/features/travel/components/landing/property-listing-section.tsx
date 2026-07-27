"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import type { PropertyListingItem } from "@/features/travel/data/property-listings";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";
import { InfiniteMarquee } from "./infinite-marquee";
import { PropertyListingCard } from "./property-listing-card";

type PropertyListingSectionProps = {
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  items: PropertyListingItem[];
  seeMoreHref?: string;
};

export function PropertyListingSection({
  titleKey,
  descriptionKey,
  items,
  seeMoreHref = "/?section=accommodations&view=results",
}: PropertyListingSectionProps) {
  const t = useTranslation();

  return (
    <section className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-bold font-montserrat text-[#1E1E1E]">
            {t(titleKey)}
          </h2>
          <p className="mt-0.5 font-medium font-satoshi text-foreground">
            {t(descriptionKey)}
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

      <InfiniteMarquee itemCount={items.length}>
        {[...items, ...items].map((item, index) => (
          <PropertyListingCard key={`${item.id}-${index}`} item={item} />
        ))}
      </InfiniteMarquee>
    </section>
  );
}
