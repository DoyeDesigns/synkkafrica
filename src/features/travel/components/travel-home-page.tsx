"use client";

import { Suspense } from "react";

import { CarRentalsFeaturesBar } from "@/features/travel/components/landing/car-rentals/car-rentals-features-bar";
import { ToursAttractionsSection } from "@/features/travel/components/landing/tours/tours-attractions-section";
import { ToursEventsSection } from "@/features/travel/components/landing/tours/tours-events-section";
import { ToursFlightPromoSection } from "@/features/travel/components/landing/tours/tours-flight-promo-section";
import { ToursPackagesSection } from "@/features/travel/components/landing/tours/tours-packages-section";
import { HeroSection } from "@/features/travel/components/hero/hero-section";
import { SectionBodyContent } from "@/features/travel/components/section-body-content";
import { useTravelNavigation } from "@/features/travel/hooks/use-travel-navigation";
import { AccommodationFiltersProvider } from "@/features/travel/providers/accommodation-filters-provider";
import { CarRentalFiltersProvider } from "@/features/travel/providers/car-rental-filters-provider";
import { TourFiltersProvider } from "@/features/travel/providers/tour-filters-provider";

function TravelHomeContent() {
  const { section, view, setSection, submitSearch, isPending } =
    useTravelNavigation();
  const showCarRentalsFeaturesBar =
    section === "car-rentals" && view === "landing";
  const showToursAttractionsSection =
    section === "tours" && view === "landing";

  return (
    <AccommodationFiltersProvider>
      <CarRentalFiltersProvider>
        <TourFiltersProvider>
        <HeroSection
          section={section}
          onSectionChange={setSection}
          onSearch={submitSearch}
          isPending={isPending}
        />
        {showCarRentalsFeaturesBar ? <CarRentalsFeaturesBar /> : null}
        {showToursAttractionsSection ? <ToursAttractionsSection /> : null}
        {showToursAttractionsSection ? <ToursEventsSection /> : null}
        {showToursAttractionsSection ? <ToursFlightPromoSection /> : null}
        {showToursAttractionsSection ? <ToursPackagesSection /> : null}
        <SectionBodyContent />
        </TourFiltersProvider>
      </CarRentalFiltersProvider>
    </AccommodationFiltersProvider>
  );
}

export function TravelHomePage() {
  return (
    <Suspense fallback={<div className="min-h-[550px] bg-zinc-900" />}>
      <TravelHomeContent />
    </Suspense>
  );
}
