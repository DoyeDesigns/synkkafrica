import type { TranslationKey } from "@/lib/preferences/translations";

/** Maps stored English filter values to translation keys (display only). */
export const FILTER_OPTION_KEY_MAP: Record<string, TranslationKey> = {
  Hotels: "filters.propertyType.hotels",
  Apartments: "filters.propertyType.apartments",
  Resorts: "filters.propertyType.resorts",
  "B&Bs": "filters.propertyType.bbs",
  "Guest House": "filters.propertyType.guestHouse",
  Studio: "filters.bedroom.studio",
  "1 bedroom": "filters.bedroom.one",
  "2 bedrooms": "filters.bedroom.two",
  "3+ bedrooms": "filters.bedroom.threePlus",
  "Breakfast included": "filters.perk.breakfast",
  "Free cancellation": "filters.perk.cancellation",
  "Pool access": "filters.perk.pool",
  "Airport shuttle": "filters.perk.shuttle",
  "10% off Discounts": "filters.discount.tenPercent",
  "All discounts": "filters.discount.all",
  "With discount": "filters.discount.withDiscount",
  "No discount": "filters.discount.noDiscount",
  SUV: "filters.carType.suv",
  Sedan: "filters.carType.sedan",
  Hatchback: "filters.carType.hatchback",
  Pickup: "filters.carType.pickup",
  "Self drive": "filters.serviceType.selfDrive",
  Chauffeur: "filters.serviceType.chauffeur",
  Automatic: "filters.transmission.automatic",
  Manual: "filters.transmission.manual",
  "All categories": "filters.tourCategory.all",
  Outdoor: "filters.tourCategory.outdoor",
  "Arts & Culture": "filters.tourCategory.artsCulture",
  Adventure: "filters.tourCategory.adventure",
  "Food & Drink": "filters.tourCategory.foodDrink",
  "All experiences": "filters.experienceType.all",
  Tours: "filters.experienceType.tours",
  Activities: "filters.experienceType.activities",
  Workshops: "filters.experienceType.workshops",
  "Day trips": "filters.experienceType.dayTrips",
};

export const PRICE_RANGE_LABEL_KEYS: Record<string, TranslationKey> = {
  "under-50k": "filters.priceRange.under50k",
  "50-150k": "filters.priceRange.50to150k",
  "150k-plus": "filters.priceRange.150kPlus",
};

export const PROPERTY_TYPE_ID_KEY_MAP: Record<string, TranslationKey> = {
  hotels: "filters.propertyType.hotels",
  resorts: "filters.propertyType.resorts",
  apartments: "filters.propertyType.apartments",
  bnbs: "filters.propertyType.bbs",
  "beach-house": "filters.propertyType.beachHouse",
  "guest-house": "filters.propertyType.guestHouse",
  motels: "filters.propertyType.motels",
};
