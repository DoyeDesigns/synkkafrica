"use client";

import { TRAVEL_SECTION_MAP } from "@/features/travel/constants";
import { HeroTabs } from "@/features/travel/components/hero/hero-tabs";
import { SectionSearchForm } from "@/features/travel/components/hero/forms";
import type { TravelSection } from "@/features/travel/types";

type HeroSectionProps = {
  section: TravelSection;
  onSectionChange: (section: TravelSection) => void;
  onSearch: (fields: Record<string, string>) => void;
  isPending?: boolean;
};

export function HeroSection({
  section,
  onSectionChange,
  onSearch,
  isPending = false,
}: HeroSectionProps) {
  const config = TRAVEL_SECTION_MAP[section];

  return (
    <section className="relative min-h-[550px] w-full overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
        style={{
          backgroundImage: `url('${config.heroImage}'), linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45))`,
        }}
      />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-4 pb-10 pt-28 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-center text-4xl font-montserrat font-bold text-white sm:text-4xl">
          {config.headline}
        </h1>

        <div
          className={`w-full rounded-2xl bg-black/10 backdrop-blur-[8.9px] transition-opacity ${
            isPending ? "opacity-70" : "opacity-100"
          }`}
        >
          <HeroTabs activeSection={section} onSectionChange={onSectionChange} />

          <div className="pt-5 px-10 lg:px-20 pb-10">
            <SectionSearchForm section={section} onSubmit={onSearch} />
          </div>
        </div>
      </div>
    </section>
  );
}
