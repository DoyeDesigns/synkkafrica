"use client";

import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { TOUR_ATTRACTIONS } from "@/features/travel/data/tours-landing";
import { useTranslation } from "@/hooks/use-translation";

const MOBILE_INITIAL_VISIBLE = 6;

export function ToursAttractionsSection() {
  const t = useTranslation();
  const [showAll, setShowAll] = useState(false);
  const attractions = [...TOUR_ATTRACTIONS, ...TOUR_ATTRACTIONS];
  const hasMoreBelowLg = attractions.length > MOBILE_INITIAL_VISIBLE;

  return (
    <section className="w-full">
      <div className="mx-auto bg-[#F9F9F9] max-w-7xl mt-10 md:rounded-2xl px-4 pb-0 py-10 sm:px-6 lg:px-8 lg:py-12">
        <h2 className="text-[22px] font-bold font-montserrat text-[#1E1E1E]">
          {t("landing.tours.attractions.title")}
        </h2>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {attractions.map((attraction, index) => (
            <article
              key={`${attraction.id}-${index}`}
              className={`group relative aspect-3/4 overflow-hidden rounded-2xl${
                !showAll && index >= MOBILE_INITIAL_VISIBLE ? " hidden lg:block" : ""
              }`}
            >
              <Image
                src={attraction.image}
                alt={attraction.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              />

              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-base font-bold font-satoshi text-white underline decoration-white underline-offset-2">
                  {attraction.name}
                </p>
                <p className="mt-1 text-sm font-medium font-satoshi text-white/90">
                  {t("landing.activitiesCount", { count: attraction.activityCount })}
                </p>
              </div>
            </article>
          ))}
        </div>

        {!showAll && hasMoreBelowLg ? (
          <div className="mt-8 relative z-10 flex justify-center -mb-7 lg:hidden">
            <button
              type="button"
              onClick={() => setShowAll(true)}
              aria-label="Show more attractions"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D85A30] text-white shadow-md transition-opacity hover:opacity-90"
            >
              <ChevronDown className="h-6 w-6" strokeWidth={2.5} />
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
