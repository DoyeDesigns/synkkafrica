"use client";

import { ArrowRight, ChevronDown, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

import { TRAVEL_CAROUSEL_SCROLL_CLASS } from "@/features/travel/constants";
import {
  TOUR_PACKAGE_CAROUSEL_ITEMS,
  TOUR_PACKAGES_PATH,
} from "@/features/tour-packages/data/tour-packages";
import { useTranslation } from "@/hooks/use-translation";

export function ToursPackagesSection() {
  const t = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollNext = () => {
    const container = scrollRef.current;
    if (!container) return;

    const card = container.querySelector("article");
    const gap = 20;
    const scrollAmount = card ? card.clientWidth + gap : 280;

    container.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  return (
    <section className="w-full mb-25">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-[22px] mb-2 font-bold font-montserrat text-[#1E1E1E]">
              {t("landing.tours.packages.title")}
            </h2>
            <p className="mt-0.5 font-medium font-satoshi text-foreground">
              {t("landing.tours.packages.description")}
            </p>
          </div>

          <Link
            href={TOUR_PACKAGES_PATH}
            className="inline-flex shrink-0 items-center gap-2 text-sm font-medium font-satoshi text-foreground hover:opacity-80"
          >
            {t("common.seeMore")}
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-white">
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>

        <div className="relative mt-6">
          <div
            ref={scrollRef}
            className={`flex gap-5 overflow-x-auto scroll-smooth pb-2 pr-14 ${TRAVEL_CAROUSEL_SCROLL_CLASS}`}
          >
            {TOUR_PACKAGE_CAROUSEL_ITEMS.map((item) => (
              <Link
                key={item.id}
                href={TOUR_PACKAGES_PATH}
                className="block shrink-0"
              >
                <article className="relative h-[232px] w-[260px] overflow-hidden rounded-2xl bg-zinc-100">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    sizes="260px"
                  />
                </article>
              </Link>
            ))}
          </div>

          <button
            type="button"
            onClick={scrollNext}
            aria-label="Scroll tour packages"
            className="absolute right-0 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[#D85A30] text-white shadow-md transition-opacity hover:opacity-90"
          >
            <ChevronRight className="h-6 w-6" strokeWidth={2.5} />
          </button>
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            href={TOUR_PACKAGES_PATH}
            className="inline-flex items-center gap-2 rounded-lg border border-[#D85A30] bg-white px-8 py-3 text-sm font-medium font-satoshi text-[#D85A30] transition-colors hover:bg-[#FFF1EB]"
          >
            {t("common.seeMore")}
            <ChevronDown className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
