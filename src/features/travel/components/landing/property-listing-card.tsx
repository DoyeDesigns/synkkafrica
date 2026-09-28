import { Coffee, Dumbbell, Flame, Heart, Star } from "lucide-react";
import Image from "next/image";

import { T } from "@/components/translation";
import { ListingCardLink } from "@/features/travel/components/listing-card-link";

import type {
  PropertyListingAmenity,
  PropertyListingItem,
} from "@/features/travel/data/property-listings";
import { DisplayPrice } from "@/components/display-price";
import { getPropertyBookingPath } from "@/features/travel/booking/paths";

function AmenityItem({ icon, label }: PropertyListingAmenity) {
  const Icon = icon === "coffee" ? Coffee : Dumbbell;

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-foreground font-satoshi font-medium">
      <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
      {label}
    </span>
  );
}

type PropertyListingCardProps = {
  item: PropertyListingItem;
  saved?: boolean;
};

export function PropertyListingCard({ item, saved = false }: PropertyListingCardProps) {
  const fullStars = Math.floor(item.rating);
  const href = getPropertyBookingPath(item.id);

  return (
    <article className="relative flex w-[295px] min-w-[295px] shrink-0 flex-col overflow-hidden rounded-2xl border border-black/10 bg-white transition-shadow hover:shadow-md">
      <ListingCardLink href={href} label={item.name} />
      <div className="relative z-[2] h-40 w-full bg-zinc-100 pointer-events-none">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="rounded-t-2xl object-cover"
          sizes="280px"
        />

        <button
          type="button"
          aria-label={saved ? "Remove from saved" : "Save property"}
          className={`absolute top-3 z-[2] flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm pointer-events-auto ${
            saved ? "right-3" : "left-3"
          }`}
        >
          <Heart
            className={
              saved
                ? "h-4 w-4 fill-[#E53935] text-[#E53935]"
                : "h-5.5 w-5.5 text-foreground"
            }
            strokeWidth={saved ? 1.5 : 1}
          />
        </button>

        <span className="absolute right-3 -bottom-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#D85A30] shadow-sm">
          <Flame className="h-4 w-4 fill-white text-white" />
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 px-4 pb-4 pt-3">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              className={`h-3 w-3 ${
                index < fullStars
                  ? "fill-amber-400 text-amber-400"
                  : "fill-zinc-200 text-zinc-200"
              }`}
            />
          ))}
        </div>

        <div>
          <h3 className="font-bold text-sm font-montserrat text-foreground">{item.name}</h3>
          <p className="text-sm text-foreground font-satoshi font-medium">{item.location}</p>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {item.amenities.map((amenity) => (
            <AmenityItem key={amenity.label} {...amenity} />
          ))}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <div>
            <p className="text-xs text-foreground font-satoshi font-medium">
              <T k="common.startingFrom" />
            </p>
            <p className="text-lg font-montserrat font-bold text-[#D85A30]">
              <DisplayPrice currency={item.currency} amount={item.price} />
            </p>
          </div>

          <span className="rounded-[5px] font-montserrat font-bold bg-[#2F2F2F] px-4 py-2.5 text-xs text-white">
            <T k="common.bookNow" />
          </span>
        </div>
      </div>
    </article>
  );
}
