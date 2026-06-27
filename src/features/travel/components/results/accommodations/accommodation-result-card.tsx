import {
  BedDouble,
  Car,
  Coffee,
  Heart,
  MapPin,
  Percent,
  BadgePercent,
  Star,
  Wifi,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { DisplayPrice } from "@/components/display-price";
import { ReviewCount } from "@/components/review-count";
import { T } from "@/components/translation";
import { getPropertyBookingPath } from "@/features/travel/booking/paths";
import type { AccommodationResult } from "@/features/travel/data/accommodation-results";

type AccommodationResultCardProps = {
  item: AccommodationResult;
};

function FeatureIcon({ icon }: { icon: AccommodationResult["features"][number]["icon"] }) {
  switch (icon) {
    case "bed":
      return <BedDouble className="h-3.5 w-3.5" strokeWidth={1.75} />;
    case "wifi":
      return <Wifi className="h-3.5 w-3.5" strokeWidth={1.75} />;
    case "coffee":
      return <Coffee className="h-3.5 w-3.5" strokeWidth={1.75} />;
    case "car":
      return <Car className="h-3.5 w-3.5" strokeWidth={1.75} />;
  }
}

export function AccommodationResultCard({ item }: AccommodationResultCardProps) {
  const fullStars = Math.floor(item.rating);

  return (
    <article className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
      <div className="flex flex-col lg:flex-row">
        <div className="relative h-52 w-full m-3 mr-0 shrink-0 lg:h-auto lg:w-[240px]">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover rounded-[10px]"
            sizes="(max-width: 1024px) 100vw, 240px"
          />

          <button
            type="button"
            aria-label="Save stay"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm"
          >
            <Heart className="h-4 w-4 text-foreground" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex flex-1 flex-col justify-between gap-4 p-4 sm:p-5">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-sm font-satoshi text-foreground">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={`h-3.5 w-3.5 ${
                      index < fullStars
                        ? "fill-amber-400 text-amber-400"
                        : "fill-zinc-200 text-zinc-200"
                    }`}
                  />
                ))}
              </div>
              <ReviewCount
                rating={item.rating}
                reviewCount={item.reviewCount}
                className="font-medium text-foreground"
              />
            </div>

            <div>
              <h2 className="font-bold font-montserrat text-foreground">
                {item.name}
              </h2>
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-normal font-satoshi text-[#2F2F2F]">
                <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                {item.location}
              </p>
            </div>

            <div className="flex flex-wrap mt-4.5 gap-x-4 gap-y-2">
              {item.features.map((feature) => (
                <span
                  key={feature.label}
                  className="inline-flex items-center gap-1.5 text-xs font-medium font-satoshi text-foreground"
                >
                  <FeatureIcon icon={feature.icon} />
                  {feature.label}
                </span>
              ))}
            </div>
          </div>

          <Link
            href={getPropertyBookingPath(item.id)}
            className="inline-flex w-fit rounded-md bg-[#D85A30] px-5 py-2.5 text-sm font-bold font-montserrat text-white transition-opacity hover:opacity-90 sm:w-full sm:max-w-[271px] sm:justify-center"
          >
            <T k="common.bookNow" />
          </Link>
        </div>

        <div className="flex flex-col justify-between p-4 sm:p-5">
          {item.dealLabel ? (
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#004785] px-3 py-1 text-xs font-semibold font-satoshi text-white">
              <BadgePercent className="h-3.5 w-3.5" />
              {item.dealLabel}
            </span>
          ) : (
            <span />
          )}

          <div className="mt-4 lg:mt-auto">
            <p className="text-xs font-medium font-satoshi text-foreground">
              <T k="common.startingFrom" />
            </p>
            <p className="mt-1 text-lg font-bold font-montserrat text-foreground">
              <DisplayPrice currency={item.currency} amount={item.price} />
            </p>
            <p className="mt-1 text-[19px] font-medium font-satoshi text-red-500 line-through">
              <DisplayPrice currency={item.currency} amount={item.originalPrice} />
            </p>
            <p className="mt-3 text-xs font-medium font-satoshi text-[#135391]">
              <T k="common.excludingTaxes" />
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
