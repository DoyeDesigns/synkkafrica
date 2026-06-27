import { BadgeCheck, Heart, MapPin, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { DisplayPrice } from "@/components/display-price";
import { ReviewCount } from "@/components/review-count";
import { T } from "@/components/translation";
import { getTourBookingPath } from "@/features/travel/booking/tour-paths";
import type { TourEvent } from "@/features/travel/data/tours-landing";

type TourEventCardProps = {
  event: TourEvent;
};

export function TourEventCard({ event }: TourEventCardProps) {
  const fullStars = Math.floor(event.rating);

  return (
    <article className="overflow-hidden rounded-2xl border border-[#EEEEEE] bg-white shadow-sm">
      <div className="flex flex-col sm:flex-row">
        <div className="relative m-3 mb-0 aspect-4/3 shrink-0 overflow-hidden rounded-[10px] bg-zinc-100 sm:mb-3 sm:aspect-auto sm:w-[200px]">
          <Image
            src={event.image}
            alt={event.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 200px"
          />

          <button
            type="button"
            aria-label="Save experience"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm"
          >
            <Heart className="h-4 w-4 text-foreground" strokeWidth={1.5} />
          </button>

          {event.selfDriveAvailable ? (
            <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-medium font-satoshi text-foreground shadow-sm">
              <Image src="/tabler_wheel.png" alt="" width={14} height={14} aria-hidden />
              <T k="common.selfDriveAvailable" />
            </span>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 pt-3 sm:py-4 sm:pl-0">
          <div className="flex flex-wrap justify-end items-center gap-2 text-sm font-satoshi text-foreground">
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
              rating={event.rating}
              reviewCount={event.reviewCount}
              className="font-medium text-foreground"
            />
          </div>

          <div>
            <h3 className="font-bold font-montserrat text-foreground">{event.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm font-satoshi text-foreground">
              {event.description}
            </p>
            <div className="flex items-center justify-between mt-2">
            <p className="inline-flex items-center gap-1.5 text-sm font-satoshi text-[#2F2F2F]">
              <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
              {event.location}
            </p>
            {event.available ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C4F02F]/30 px-2.5 py-1 text-xs font-medium font-satoshi text-[#2E7D32]">
                  <BadgeCheck className="h-3.5 w-3.5" strokeWidth={2} stroke="#C4F02F" fill="#1A9E37" />
                  <T k="common.available" />
                </span>
              ) : null}
            </div>
          </div>

          <div className="mt-auto flex flex-wrap items-end justify-between gap-3">
            <div className="space-y-2">
              <div>
                <p className="text-xs font-medium font-satoshi text-foreground">
                  <T k="common.budget" />
                </p>
                <p className="text-lg font-bold font-montserrat text-foreground">
                  <DisplayPrice currency={event.currency} amount={event.price} />
                </p>
              </div>
            </div>

            <Link
              href={getTourBookingPath(event.id)}
              className="rounded-[5px] bg-[#3C3C3C] px-5 py-2.5 text-xs font-bold font-montserrat text-white transition-opacity hover:opacity-90"
            >
              <T k="common.bookNow" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
