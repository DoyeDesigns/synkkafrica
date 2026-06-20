"use client";

import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";

import { FAVOURITE_DESTINATIONS } from "@/features/travel/data/accommodations-landing";
import { TRAVEL_CAROUSEL_SCROLL_CLASS } from "@/features/travel/constants";

export function FavouriteDestinationsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollNext = () => {
    const container = scrollRef.current;
    if (!container) return;

    const card = container.querySelector("article");
    const gap = 16;
    const scrollAmount = card ? card.clientWidth + gap : 216;

    container.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  return (
    <section className="mt-20 mb-25 rounded-2xl bg-[#F3F3F3] px-11 pt-9.5 pb-6.5">
      <h2 className="text-[22px] font-bold font-montserrat text-[#1E1E1E]">
        Explore Favourite Destinations
      </h2>

      <div className="relative mt-6">
        <div
          ref={scrollRef}
          className={`flex gap-4 overflow-x-auto scroll-smooth pb-2 pr-14 ${TRAVEL_CAROUSEL_SCROLL_CLASS}`}
        >
          {FAVOURITE_DESTINATIONS.map((destination) => (
            <article
              key={destination.id}
              className="group relative h-[286px] min-w-[217px] shrink-0 overflow-hidden rounded-2xl border-2 border-transparent transition-colors hover:border-[#3B82F6] sm:min-w-[200px]"
            >
              <Image
                src={destination.image}
                alt={destination.name}
                fill
                className="object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-base font-bold font-satoshi text-white">
                  {destination.name}
                </p>
                <p className="mt-0.5 text-sm font-medium font-satoshi text-white/90">
                  {destination.activityCount} activities
                </p>
              </div>
            </article>
          ))}
        </div>

        <button
          type="button"
          onClick={scrollNext}
          aria-label="Scroll destinations"
          className="absolute right-0 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[#D85A30] text-white shadow-md transition-opacity hover:opacity-90"
        >
          <ChevronRight className="h-6 w-6" strokeWidth={2.5} />
        </button>
      </div>
    </section>
  );
}
