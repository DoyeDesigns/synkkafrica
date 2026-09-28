import { CarFront, Heart, MapPin, Star } from "lucide-react";
import Image from "next/image";

import { DisplayPrice } from "@/components/display-price";
import { ReviewCount } from "@/components/review-count";
import { T } from "@/components/translation";
import { getCarBookingPath } from "@/features/travel/booking/car-paths";
import { ListingCardLink } from "@/features/travel/components/listing-card-link";
import type { CarRentalResult } from "@/features/travel/data/car-rental-results";

type CarRentalResultCardProps = {
  item: CarRentalResult;
  saved?: boolean;
};

export function CarRentalResultCard({ item, saved = false }: CarRentalResultCardProps) {
  const fullStars = Math.floor(item.rating);
  const href = getCarBookingPath(item.id);

  return (
    <article className="relative flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition-shadow hover:shadow-md">
      <ListingCardLink href={href} label={item.name} />
      <div className="relative z-[2] m-3 mb-0 aspect-4/3 overflow-hidden rounded-[10px] bg-zinc-100 pointer-events-none">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />

        <button
          type="button"
          aria-label={saved ? "Remove from saved" : "Save car"}
          className="absolute right-3 top-3 z-[2] flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm pointer-events-auto"
        >
          <Heart
            className={`h-4 w-4 ${
              saved ? "fill-[#E53935] text-[#E53935]" : "text-foreground"
            }`}
            strokeWidth={1.5}
          />
        </button>

        {item.selfDriveAvailable ? (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-medium font-satoshi text-foreground shadow-sm">
            <Image src="/tabler_wheel.png" alt="" width={14} height={14} aria-hidden />
            <T k="common.selfDriveAvailable" />
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
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
          <h2 className="font-bold font-montserrat text-foreground">{item.name}</h2>
          <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-normal font-satoshi text-[#2F2F2F]">
            <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
            {item.location}
          </p>
        </div>

        <div className="mt-auto space-y-3">
          <div className="flex items-end justify-between">
          <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold font-satoshi text-[#2F2F2F]">
            <CarFront className="h-4.5 w-4.5 shrink-0" strokeWidth={1.5} />
            {item.carType}
          </p>

          <div>
            <p className="text-xs font-medium font-satoshi text-foreground/70">
              <T k="common.perDay" />
            </p>
            <p className="text-lg font-bold font-montserrat text-foreground">
              <DisplayPrice currency={item.currency} amount={item.pricePerDay} />
            </p>
          </div>
          </div>

          <span className="block w-full rounded-md bg-[#D85A30] px-5 py-2.5 text-center text-sm font-bold font-montserrat text-white">
            <T k="common.bookNow" />
          </span>
        </div>
      </div>
    </article>
  );
}
