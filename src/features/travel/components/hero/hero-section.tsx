"use client";

import { TRAVEL_SECTION_MAP } from "@/features/travel/constants";
import { HeroBackground } from "@/features/travel/components/hero/hero-background";
import { HeroTabs } from "@/features/travel/components/hero/hero-tabs";
import { SectionSearchForm } from "@/features/travel/components/hero/forms";
import { ClearFilterButton } from "@/features/travel/components/results/shared/clear-filter-button";
import { useTranslation } from "@/hooks/use-translation";
import { useTravelNavigation } from "@/features/travel/hooks/use-travel-navigation";
import { useAccommodationFiltersContext } from "@/features/travel/providers/accommodation-filters-provider";
import { useCarRentalFiltersContext } from "@/features/travel/providers/car-rental-filters-provider";
import { useTourFiltersContext } from "@/features/travel/providers/tour-filters-provider";
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
  const t = useTranslation();
  const config = TRAVEL_SECTION_MAP[section];
  const { view } = useTravelNavigation();
  const accommodationFilters = useAccommodationFiltersContext();
  const tourFilters = useTourFiltersContext();
  const carRentalFilters = useCarRentalFiltersContext();

  const showClearFilter =
    view === "results" &&
    ((section === "accommodations" && accommodationFilters.hasAppliedFilters) ||
      (section === "tours" && tourFilters.hasAppliedFilters) ||
      (section === "car-rentals" && carRentalFilters.hasAppliedFilters));

  const handleClearFilters = () => {
    if (section === "accommodations") {
      accommodationFilters.resetFilters();
      return;
    }

    if (section === "tours") {
      tourFilters.resetFilters();
      return;
    }

    if (section === "car-rentals") {
      carRentalFilters.resetFilters();
    }
  };

  return (
    <section className="relative min-h-[550px] w-full overflow-hidden">
      <HeroBackground
        heroImage={config.heroImage}
        isAccommodations={section === "accommodations"}
      />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-4 pb-10 pt-28 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-center text-4xl font-montserrat font-bold text-white sm:text-4xl">
          {t("hero.headline")}
        </h1>

        <div
          className={`w-full rounded-2xl bg-black/10 backdrop-blur-[8.9px] transition-opacity ${
            isPending ? "opacity-70" : "opacity-100"
          }`}
        >
          <HeroTabs activeSection={section} onSectionChange={onSectionChange} />

          <div className="pt-5 px-10 lg:px-20 pb-10">
            <SectionSearchForm section={section} onSubmit={onSearch} />
            {showClearFilter ? (
              <div className="mt-4">
                <ClearFilterButton onClick={handleClearFilters} />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
