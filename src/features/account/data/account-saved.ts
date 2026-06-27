import { CAR_RENTAL_RESULTS } from "@/features/travel/data/car-rental-results";
import { FEATURED_PROPERTIES } from "@/features/travel/data/property-listings";

export type SavedTourItem = {
  id: string;
  image: string;
  alt: string;
};

export const SAVED_ACCOMMODATIONS = [
  ...FEATURED_PROPERTIES,
  {
    ...FEATURED_PROPERTIES[0],
    id: "eko-hotels-5",
  },
];

export const SAVED_CARS = CAR_RENTAL_RESULTS.slice(0, 2);

export const SAVED_TOURS: SavedTourItem[] = [
  {
    id: "saved-tour-italy",
    image: "/promo/experience.png",
    alt: "Italy tour",
  },
  {
    id: "saved-tour-thailand",
    image: "/hero/tours.png",
    alt: "Thailand tour",
  },
  {
    id: "saved-tour-malaysia",
    image: "/destinations/dubai.png",
    alt: "Malaysia tour",
  },
];
