import type { TravelSection, TravelSectionConfig } from "./types";

/**
 * When you say "sync forms from reference", styling/structure is copied
 * from ACCOMMODATIONS into flights, car-rentals, and tours search forms.
 */
export const FORM_REFERENCE_SECTION: TravelSection = "accommodations";

/** Rotating hero backgrounds for the accommodations section. */
export const ACCOMMODATIONS_HERO_IMAGES = [
  "/hero/accomodations/c0ea5f93656a3e5da2a9ee3ef099dd3f316a2a09.jpg",
  "/hero/accomodations/bc926fd99b1d544dcd78428d822ed93a9d3bec08.jpg",
  "/hero/accomodations/3bd7c33eb47a06fd682702112980e1d211694a4d.jpg",
  "/hero/accommodations.png",
] as const;

export const ACCOMMODATIONS_HERO_ROTATION_MS = 6000;

/** Hidden scrollbar by default; shows on hover. Use on horizontal carousel tracks. */
export const TRAVEL_CAROUSEL_SCROLL_CLASS =
  "[-ms-overflow-style:none] [scrollbar-none] [&::-webkit-scrollbar]:hidden travel-carousel-hover-scroll";

export const TRAVEL_SECTIONS: TravelSectionConfig[] = [
  {
    id: "accommodations",
    label: "Accommodations",
    headline: "All you need in one place",
    heroImage: "/hero/accommodations.png",
    landingBlurb:
      "Accommodations landing — browse curated stays across Africa.",
    resultsBlurb:
      "Accommodations results — showing available properties for your search.",
  },
  {
    id: "flights",
    label: "Flights",
    headline: "All you need in one place",
    heroImage: "/hero/flights.png",
    landingBlurb: "Flights landing — compare routes and fares in one search.",
    resultsBlurb: "Flights results — showing matching itineraries for your trip.",
  },
  {
    id: "car-rentals",
    label: "Car Rentals",
    headline: "All you need in one place",
    heroImage: "/hero/car-rentals.png",
    landingBlurb:
      "Car rentals landing — self-drive and chauffeur options near you.",
    resultsBlurb:
      "Car rentals results — showing vehicles that match your filters.",
  },
  {
    id: "tours",
    label: "Tours & Experiences",
    headline: "All you need in one place",
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
