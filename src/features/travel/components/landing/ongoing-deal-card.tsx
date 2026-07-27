import Image from "next/image";

import { DisplayPrice } from "@/components/display-price";
import { T } from "@/components/translation";
import type { AccommodationDeal } from "@/features/travel/data/accommodations-landing";
import { StarRating } from "./accommodations/shared";

type OngoingDealCardProps = {
  item: AccommodationDeal;
};

function getDiscountPercent(originalPrice: number, currentPrice: number) {
  if (originalPrice <= currentPrice || originalPrice <= 0) {
    return null;
  }

  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}

export function OngoingDealCard({ item }: OngoingDealCardProps) {
  const discountPercent = getDiscountPercent(
    item.originalPrice,
    item.currentPrice,
  );

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

        {discountPercent ? (
          <span className="absolute left-4 top-4 z-10 rounded-[10px] bg-[#1A9E37] px-2.5 py-1 text-sm font-bold font-satoshi text-white">
            -{discountPercent}%
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col justify-center gap-2 p-4">
        <div>
          <h3 className="font-bold font-montserrat text-foreground">{item.name}</h3>
          <p className="text-sm font-medium text-foreground">{item.location}</p>
        </div>

        <StarRating rating={item.rating} reviewCount={item.reviewCount} />

        <div className="mt-3">
          <p className="text-xs font-satoshi text-foreground">
            <T k="common.startingFrom" />
          </p>
          <div className="flex flex-wrap items-baseline gap-2 font-montserrat">
            <span className="text-sm text-red-500 line-through">
              <DisplayPrice currency={item.currency} amount={item.originalPrice} />
            </span>
            <span className="text-lg font-bold text-foreground">
              <DisplayPrice currency={item.currency} amount={item.currentPrice} />
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
