"use client";

import { AccommodationsLanding } from "@/features/travel/components/landing/accommodations/accommodations-landing";
import { CarRentalsLanding } from "@/features/travel/components/landing/car-rentals/car-rentals-landing";
import { ToursLanding } from "@/features/travel/components/landing/tours/tours-landing";
import { CarRentalsExplorePage } from "@/features/travel/components/results/car-rentals/car-rentals-explore-page";
import { AccommodationsResultsPage } from "@/features/travel/components/results/accommodations/accommodations-results-page";
import { ToursResultsPage } from "@/features/travel/components/results/tours/tours-results-page";
import { useSectionContent } from "@/features/travel/hooks/use-section-content";
import { useTravelNavigation } from "@/features/travel/hooks/use-travel-navigation";

function SectionResultsFallback() {
  const { resetToLanding } = useTravelNavigation();
  const { content, isLoading, config } = useSectionContent();

  return (
    <div className="rounded-xl border border-black/10 bg-white p-8 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#e45d25]">
        {config.label} · Results
      </p>

      {isLoading ? (
        <p className="mt-3 text-foreground/70">Loading results...</p>
      ) : (
        <p className="mt-3 text-lg text-foreground">{content}</p>
      )}

      <button
        type="button"
        onClick={resetToLanding}
        className="mt-6 text-sm font-medium text-[#e45d25] hover:underline"
      >
        Back to {config.label} landing
      </button>
    </div>
  );
}

function GenericSectionLanding() {
  const { content, isLoading, config } = useSectionContent();

  return (
    <div className="rounded-xl border border-black/10 bg-white p-8 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#e45d25]">
        {config.label} · Landing
      </p>

      {isLoading ? (
        <p className="mt-3 text-foreground/70">Loading section content...</p>
      ) : (
        <p className="mt-3 text-lg text-foreground">{content}</p>
      )}
    </div>
  );
}

export function SectionBodyContent() {
  const { section, view } = useTravelNavigation();
  const isAccommodationResults = section === "accommodations" && view === "results";
  const isCarRentalsExplore =
    section === "car-rentals" && (view === "landing" || view === "results");
  const isToursResults = section === "tours" && view === "results";
  const isToursLanding = section === "tours" && view === "landing";

  if (isToursLanding) {
    return null;
  }

  return (
    <main
      className={`${
        isAccommodationResults || isCarRentalsExplore || isToursResults
          ? "bg-[#F5F5F5]"
          : ""
      }`}
    >
      <section
      className={`xl:mx-auto lg:mx-auto xl:max-w-7xl lg:max-w-5xl sm:px-6 lg:px-8 ${
        isAccommodationResults || isCarRentalsExplore || isToursResults
          ? "px-4 pb-12 pt-8"
          : "px-4 pt-16.5 py-12"
      }`}
    >
      {view === "results" && section === "accommodations" ? (
        <AccommodationsResultsPage />
      ) : view === "results" && section === "car-rentals" ? (
        <CarRentalsExplorePage />
      ) : view === "results" && section === "tours" ? (
        <ToursResultsPage />
      ) : view === "results" ? (
        <SectionResultsFallback />
      ) : section === "accommodations" ? (
        <AccommodationsLanding />
      ) : section === "car-rentals" ? (
        <CarRentalsLanding />
      ) : section === "tours" ? (
        <ToursLanding />
      ) : (
        <GenericSectionLanding />
      )}
    </section>
    </main>
  );
}
