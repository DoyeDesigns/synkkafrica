"use client";

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

  return (
    <div className="border-b border-white/40 pt-7.5 ">
      <div className="flex flex-wrap items-center justify-center gap-6 font-inter text-sm text-white/80">
        {TRAVEL_SECTIONS.map((section) => {
          const isActive = section.id === activeSection;

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onSectionChange(section.id)}
              className={`relative pb-2.5 font-semibold transition-colors hover:text-white ${
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
  );
}
