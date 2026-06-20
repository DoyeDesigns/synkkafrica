import Image from "next/image";

import type { AccommodationDeal } from "@/features/travel/data/accommodations-landing";
import { formatPrice } from "@/features/travel/data/accommodations-landing";
import { StarRating } from "./accommodations/shared";

type OngoingDealCardProps = {
  item: AccommodationDeal;
};

export function OngoingDealCard({ item }: OngoingDealCardProps) {
  return (
    <article className="flex h-50 min-w-[320px] shrink-0 overflow-hidden rounded-2xl border border-[#BCBCBC] bg-white sm:min-w-[486px]">
      <div className="relative h-full w-36 shrink-0 bg-zinc-100 sm:w-50">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover"
          sizes="200px"
        />
      </div>

      <div className="flex flex-1 flex-col justify-center gap-2 p-4">
        <div>
          <h3 className="font-bold font-montserrat text-foreground">{item.name}</h3>
          <p className="text-sm font-medium text-foreground">{item.location}</p>
        </div>

        <StarRating rating={item.rating} reviewCount={item.reviewCount} />

        <div className="mt-3">
          <p className="text-xs font-satoshi text-foreground">Starting from</p>
          <div className="flex flex-wrap items-baseline gap-2 font-montserrat">
            <span className="text-sm text-red-500 line-through">
              {formatPrice(item.currency, item.originalPrice)}
            </span>
            <span className="text-lg font-bold text-foreground">
              {formatPrice(item.currency, item.currentPrice)}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
