import { formatPriceWithPreferences } from "@/lib/preferences/format-price";

export type AccommodationDeal = {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  originalPrice: number;
  currentPrice: number;
  currency: string;
  image: string;
};

export type PropertyType = {
  id: string;
  label: string;
  count: number;
  image: string;
};

export const ACCOMMODATION_DEALS: AccommodationDeal[] = [
  {
    id: "president-hotel",
    name: "The President Hotel",
    location: "Cape town, South Africa",
    rating: 4.2,
    reviewCount: 304,
    originalPrice: 156500,
    currentPrice: 156500,
    currency: "NGN",
    image: "/hero/accommodations.png",
  },
  {
    id: "ark-havn",
    name: "Ark Havn",
    location: "Cape town, South Africa",
    rating: 4.2,
    reviewCount: 304,
    originalPrice: 156500,
    currentPrice: 156500,
    currency: "NGN",
    image: "/hero/accommodations.png",
  },
  {
    id: "lagoon-view",
    name: "Lagoon View Suites",
    location: "Lagos, Nigeria",
    rating: 4.5,
    reviewCount: 128,
    originalPrice: 98000,
    currentPrice: 84500,
    currency: "NGN",
    image: "/hero/accommodations.png",
  },
];

export const PROPERTY_TYPES: PropertyType[] = [
  {
    id: "hotels",
    label: "Hotels",
    count: 235,
    image: "/property-types/fluent-mdl2_hotel.svg",
  },
  {
    id: "resorts",
    label: "Resorts",
    count: 38,
    image: "/property-types/fluent-mdl2_ski-resorts.svg",
  },
  {
    id: "apartments",
    label: "Apartments",
    count: 56,
    image: "/property-types/ph_building-apartment-light.svg",
  },
  {
    id: "bnbs",
    label: "B&Bs",
    count: 14,
    image: "/property-types/hugeicons_house-01.svg",
  },
  {
    id: "beach-house",
    label: "Beach House",
    count: 67,
    image: "/property-types/streamline-plump_beach.svg",
  },
  {
    id: "guest-house",
    label: "Guest House",
    count: 2,
    image: "/property-types/hugeicons_guest-house.svg",
  },
  {
    id: "motels",
    label: "Motels",
    count: 3,
    image: "/property-types/la_hotel.svg",
  },
];

export type FavouriteDestination = {
  id: string;
  name: string;
  activityCount: number;
  image: string;
};

export const FAVOURITE_DESTINATIONS: FavouriteDestination[] = [
  {
    id: "lagos",
    name: "Lagos, Nigeria",
    activityCount: 153,
    image: "/destinations/lagos.png",
  },
  {
    id: "dubai",
    name: "UAE Dubai",
    activityCount: 47,
    image: "/destinations/dubai.png",
  },
  {
    id: "cotonou",
    name: "Cotonou",
    activityCount: 28,
    image: "/destinations/cotonou.png",
  },
  {
    id: "south-africa",
    name: "South Africa",
    activityCount: 2,
    image: "/destinations/south-africa.png",
  },
  {
    id: "monaco",
    name: "Monaco",
    activityCount: 12,
    image: "/destinations/monaco.png",
  },
];

export function formatPrice(currency: string, amount: number) {
  return formatPriceWithPreferences(currency, amount);
}
