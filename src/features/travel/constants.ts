import type { TravelSection, TravelSectionConfig } from "./types";

/**
 * When you say "sync forms from reference", styling/structure is copied
 * from ACCOMMODATIONS into flights, car-rentals, and tours search forms.
 */
export const FORM_REFERENCE_SECTION: TravelSection = "accommodations";

export const TRAVEL_SECTIONS: TravelSectionConfig[] = [
  {
    id: "accommodations",
    label: "Accommodations",
    headline: "All You need in one place",
    heroImage: "/hero/accommodations.png",
    landingBlurb:
      "Accommodations landing — browse curated stays across Africa.",
    resultsBlurb:
      "Accommodations results — showing available properties for your search.",
  },
  {
    id: "flights",
    label: "Flights",
    headline: "All You need in one place",
    heroImage: "/hero/flights.png",
    landingBlurb: "Flights landing — compare routes and fares in one search.",
    resultsBlurb: "Flights results — showing matching itineraries for your trip.",
  },
  {
    id: "car-rentals",
    label: "Car Rentals",
    headline: "All You need in one place",
    heroImage: "/hero/car-rentals.png",
    landingBlurb:
      "Car rentals landing — self-drive and chauffeur options near you.",
    resultsBlurb:
      "Car rentals results — showing vehicles that match your filters.",
  },
  {
    id: "tours",
    label: "Tours & Experiences",
    headline: "All You need in one place",
    heroImage: "/hero/tours.png",
    landingBlurb:
      "Tours landing — discover cultural experiences and attractions.",
    resultsBlurb:
      "Tours results — showing experiences matching your search.",
  },
];

export const TRAVEL_SECTION_MAP = Object.fromEntries(
  TRAVEL_SECTIONS.map((section) => [section.id, section]),
) as Record<TravelSection, TravelSectionConfig>;

export function isTravelSection(value: string | null): value is TravelSection {
  return TRAVEL_SECTIONS.some((section) => section.id === value);
}

export function getDefaultSection(): TravelSection {
  return "accommodations";
}
