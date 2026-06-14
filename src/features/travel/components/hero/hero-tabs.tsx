"use client";

import { TRAVEL_SECTIONS } from "@/features/travel/constants";
import type { TravelSection } from "@/features/travel/types";

type HeroTabsProps = {
  activeSection: TravelSection;
  onSectionChange: (section: TravelSection) => void;
};

export function HeroTabs({ activeSection, onSectionChange }: HeroTabsProps) {
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
              {section.label}
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
