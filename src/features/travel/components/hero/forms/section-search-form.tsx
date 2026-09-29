"use client";

import { useSearchParams } from "next/navigation";

import type { TravelSection } from "@/features/travel/types";
import { AccommodationsSearchForm } from "./accommodations-search-form";
import { CarRentalsSearchForm } from "./car-rentals-search-form";
import { FlightsSearchForm } from "./flights-search-form";
import { ToursSearchForm } from "./tours-search-form";

type SectionSearchFormProps = {
  section: TravelSection;
  onSubmit: (fields: Record<string, string>) => void;
};

function SectionForm({ section, onSubmit }: SectionSearchFormProps) {
  switch (section) {
    case "accommodations":
      return <AccommodationsSearchForm onSubmit={onSubmit} />;
    case "flights":
      return <FlightsSearchForm onSubmit={onSubmit} />;
    case "car-rentals":
      return <CarRentalsSearchForm onSubmit={onSubmit} />;
    case "tours":
      return <ToursSearchForm onSubmit={onSubmit} />;
  }
}

export function SectionSearchForm({ section, onSubmit }: SectionSearchFormProps) {
  // The forms seed their fields from the URL once. Keying on the query string
  // remounts them whenever the URL changes (a new search, "Clear filters",
  // back/forward), so the hero always mirrors the active search.
  const searchKey = useSearchParams().toString();

  return <SectionForm key={searchKey} section={section} onSubmit={onSubmit} />;
}
