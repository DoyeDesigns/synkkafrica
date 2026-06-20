import { ArrowRight } from "lucide-react";
import Link from "next/link";

import type { PropertyListingItem } from "@/features/travel/data/property-listings";
import { TRAVEL_CAROUSEL_SCROLL_CLASS } from "@/features/travel/constants";
import { PropertyListingCard } from "./property-listing-card";

type PropertyListingSectionProps = {
  title: string;
  description: string;
  items: PropertyListingItem[];
  seeMoreHref?: string;
};

export function PropertyListingSection({
  title,
  description,
  items,
  seeMoreHref = "/?section=accommodations&view=results",
}: PropertyListingSectionProps) {
  return (
    <section className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-bold font-montserrat text-[#1E1E1E]">
            {title}
          </h2>
          <p className="mt-0.5 font-medium font-satoshi text-foreground">
            {description}
          </p>
        </div>

        <Link
          href={seeMoreHref}
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:opacity-80"
        >
          See more
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-white">
            <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      </div>

      <div className={`flex gap-5 overflow-x-auto pb-2 ${TRAVEL_CAROUSEL_SCROLL_CLASS}`}>
        {items.map((item) => (
          <PropertyListingCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
