import { formatPriceWithPreferences } from "@/lib/preferences/format-price";

export type PackageOfferInclusion = "flights" | "stays" | "carDriver";

export type AccommodationDeal = {
  id: string;
  title: string;
  days: number;
  nights: number;
  scheduleLabel: string;
  savingsPercent: number;
  currentPrice: number;
  separateBookingPrice: number;
  currency: string;
  image: string;
  inclusions: PackageOfferInclusion[];
  packageId?: string;
};

export type PropertyType = {
  id: string;
  label: string;
  count: number;
  image: string;
};

export const ACCOMMODATION_DEALS: AccommodationDeal[] = [
  {
    id: "lagos-weekend-getaway",
    title: "Lagos Weekend Getaway",
    days: 4,
    nights: 3,
    scheduleLabel: "Fri — Mon",
    savingsPercent: 20,
    currentPrice: 887_500,
    separateBookingPrice: 1_089_000,
    currency: "NGN",
    image: "/destinations/lagos.png",
    inclusions: ["flights", "stays", "carDriver"],
    packageId: "singapore-lights",
  },
  {
    id: "dubai-city-break",
    title: "Dubai City Break",
    days: 5,
    nights: 4,
    scheduleLabel: "Thu — Mon",
    savingsPercent: 18,
    currentPrice: 1_245_000,
    separateBookingPrice: 1_518_000,
    currency: "NGN",
    image: "/destinations/dubai.png",
    inclusions: ["flights", "stays", "carDriver"],
    packageId: "malaysia-getaway",
  },
  {
    id: "cape-coastal-escape",
    title: "Cape Coastal Escape",
    days: 6,
    nights: 5,
    scheduleLabel: "Sat — Thu",
    savingsPercent: 15,
    currentPrice: 962_000,
    separateBookingPrice: 1_132_000,
    currency: "NGN",
    image: "/destinations/south-africa.png",
    inclusions: ["flights", "stays", "carDriver"],
    packageId: "south-africa-safari",
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
    id: "apartments",
    label: "Apartments",
    count: 56,
    image: "/property-types/ph_building-apartment-light.svg",
  },
  {
    id: "beach-house",
    label: "Beach House",
    count: 67,
    image: "/property-types/streamline-plump_beach.svg",
  },
];

export function getPropertyTypeLabelById(id: string) {
  return PROPERTY_TYPES.find((type) => type.id === id)?.label ?? PROPERTY_TYPES[0]!.label;
}

export function getPropertyTypeIdByLabel(label: string) {
  return PROPERTY_TYPES.find(
    (type) => type.label.toLowerCase() === label.toLowerCase(),
  )?.id;
}

export function getAccommodationsPropertyTypeResultsHref(propertyTypeId: string) {
  const params = new URLSearchParams({
    section: "accommodations",
    view: "results",
    propertyType: getPropertyTypeLabelById(propertyTypeId),
  });

  return `/?${params.toString()}`;
}

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
    activityCount: 0,
    image: "/destinations/lagos.png",
  },
  {
    id: "ghana",
    name: "Ghana",
    activityCount: 0,
    image: "/destinations/ghana.jpg",
  },
  {
    id: "south-africa",
    name: "South Africa",
    activityCount: 0,
    image: "/destinations/south-africa-cape-town.jpg",
  },
  {
    id: "cote-divoire",
    name: "Côte d'Ivoire",
    activityCount: 0,
    image: "/destinations/cote-divoire.jpg",
  },
  {
    id: "senegal",
    name: "Senegal",
    activityCount: 0,
    image: "/destinations/senegal.jpg",
  },
  {
    id: "kenya",
    name: "Kenya",
    activityCount: 0,
    image: "/destinations/kenya.jpg",
  },
];

export function formatPrice(currency: string, amount: number) {
  return formatPriceWithPreferences(currency, amount);
}
