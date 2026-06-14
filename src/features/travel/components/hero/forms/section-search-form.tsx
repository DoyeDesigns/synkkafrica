"use client";

import type { TravelSection } from "@/features/travel/types";
import { AccommodationsSearchForm } from "./accommodations-search-form";
import { CarRentalsSearchForm } from "./car-rentals-search-form";
import { FlightsSearchForm } from "./flights-search-form";
import { ToursSearchForm } from "./tours-search-form";

type SectionSearchFormProps = {
  section: TravelSection;
  onSubmit: (fields: Record<string, string>) => void;
};

export function SectionSearchForm({ section, onSubmit }: SectionSearchFormProps) {
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
