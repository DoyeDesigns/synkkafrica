"use client";

import { useEffect, useRef } from "react";

import { TRAVEL_SECTIONS } from "@/features/travel/constants";
import type { TravelSection } from "@/features/travel/types";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

const SECTION_LABEL_KEYS: Record<TravelSection, TranslationKey> = {
  accommodations: "hero.tab.accommodations",
  flights: "hero.tab.flights",
  "car-rentals": "hero.tab.carRentals",
  tours: "hero.tab.tours",
};

type HeroTabsProps = {
  activeSection: TravelSection;
  onSectionChange: (section: TravelSection) => void;
};

export function HeroTabs({ activeSection, onSectionChange }: HeroTabsProps) {
  const t = useTranslation();
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const active = scroller?.querySelector<HTMLElement>("[data-active='true']");
    if (!scroller || !active) return;

    const scrollerRect = scroller.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    const delta =
      activeRect.left -
      scrollerRect.left -
      (scrollerRect.width - activeRect.width) / 2;

    scroller.scrollTo({ left: scroller.scrollLeft + delta });
  }, [activeSection]);

  return (
    <div className="border-b border-white/40 pt-7.5">
      <div
        ref={scrollerRef}
        className="overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex w-max min-w-full items-center justify-center gap-6 px-4 font-inter text-sm text-white/80">
          {TRAVEL_SECTIONS.map((section) => {
            const isActive = section.id === activeSection;

            return (
              <button
                key={section.id}
                type="button"
                data-active={isActive ? "true" : undefined}
                onClick={() => onSectionChange(section.id)}
                className={`relative shrink-0 whitespace-nowrap pb-2.5 font-semibold transition-colors hover:text-white ${
                  isActive ? "text-white px-3" : ""
                }`}
              >
                {t(SECTION_LABEL_KEYS[section.id])}
                {isActive && (
                  <span className="absolute bottom-0 left-0 h-1 w-full bg-white" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
