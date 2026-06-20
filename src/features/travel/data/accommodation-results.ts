export type AccommodationResultFeature = {
  icon: "bed" | "wifi" | "coffee" | "car";
  label: string;
};

export type AccommodationResult = {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  price: number;
  originalPrice: number;
  currency: string;
  image: string;
  dealLabel?: string;
  features: AccommodationResultFeature[];
  propertyType: string;
};

export type PriceRangeOption = "under-50k" | "50-150k" | "150k-plus";

export type AccommodationFilterState = {
  location: string;
  discounts: string;
  priceBudget: string;
  priceMin: number;
  priceMax: number;
  priceRange: PriceRangeOption | null;
  propertyType: string;
  bedrooms: string;
  ratings: string;
  perks: string;
};

export const DEFAULT_ACCOMMODATION_FILTERS: AccommodationFilterState = {
  location: "Worldwide",
  discounts: "10% off Discounts",
  priceBudget: "",
  priceMin: 50000,
  priceMax: 200000,
  priceRange: null,
  propertyType: "Hotels",
  bedrooms: "",
  ratings: "",
  perks: "",
};

export const PROPERTY_TYPE_OPTIONS = [
  "Hotels",
  "Apartments",
  "Resorts",
  "B&Bs",
  "Guest House",
] as const;

export const PRICE_RANGE_OPTIONS: {
  id: PriceRangeOption;
  label: string;
}[] = [
  { id: "under-50k", label: "Under 50k" },
  { id: "50-150k", label: "50 - 150k" },
  { id: "150k-plus", label: "150k and above" },
];

export const BEDROOM_OPTIONS = ["Studio", "1 bedroom", "2 bedrooms", "3+ bedrooms"];
export const RATING_OPTIONS = ["4.5+", "4.0+", "3.5+", "3.0+"];
export const PERK_OPTIONS = [
  "Breakfast included",
  "Free cancellation",
  "Pool access",
  "Airport shuttle",
];

export const ACCOMMODATION_RESULTS: AccommodationResult[] = [
  {
    id: "president-hotel-results",
    name: "The President Hotel",
    location: "Lekki Phase 1",
    rating: 4.6,
    reviewCount: 12,
    price: 143500,
    originalPrice: 156500,
    currency: "NGN",
    image: "/hero/accommodations.png",
    dealLabel: "10% off deal",
    propertyType: "Hotels",
    features: [
      { icon: "bed", label: "2 bedrooms" },
      { icon: "wifi", label: "Free Wi-Fi" },
    ],
  },
  {
    id: "ark-havn-results",
    name: "Ark Havn",
    location: "Victoria Island",
    rating: 4.6,
    reviewCount: 12,
    price: 143500,
    originalPrice: 156500,
    currency: "NGN",
    image: "/hero/accommodations.png",
    dealLabel: "10% off deal",
    propertyType: "Hotels",
    features: [
      { icon: "coffee", label: "Breakfast included" },
      { icon: "wifi", label: "Free Wi-Fi" },
    ],
  },
  {
    id: "lagoon-view-results",
    name: "Lagoon View Suites",
    location: "Lekki Phase 1",
    rating: 4.6,
    reviewCount: 12,
    price: 143500,
    originalPrice: 156500,
    currency: "NGN",
    image: "/hero/accommodations.png",
    dealLabel: "10% off deal",
    propertyType: "Apartments",
    features: [
      { icon: "bed", label: "1 bedroom" },
      { icon: "car", label: "Parking available" },
    ],
  },
  {
    id: "eko-hotels-results",
    name: "Eko Hotels & Suites",
    location: "Victoria Island",
    rating: 4.6,
    reviewCount: 12,
    price: 143500,
    originalPrice: 156500,
    currency: "NGN",
    image: "/hero/accommodations.png",
    dealLabel: "10% off deal",
    propertyType: "Hotels",
    features: [
      { icon: "coffee", label: "Breakfast included" },
      { icon: "bed", label: "Suite" },
    ],
  },
  {
    id: "eko-hotels-results",
    name: "Eko Hotels & Suites",
    location: "Victoria Island",
    rating: 4.6,
    reviewCount: 12,
    price: 143500,
    originalPrice: 156500,
    currency: "NGN",
    image: "/hero/accommodations.png",
    dealLabel: "10% off deal",
    propertyType: "Hotels",
    features: [
      { icon: "coffee", label: "Breakfast included" },
      { icon: "bed", label: "Suite" },
    ],
  },
  {
    id: "eko-hotels-results",
    name: "Eko Hotels & Suites",
    location: "Victoria Island",
    rating: 4.6,
    reviewCount: 12,
    price: 143500,
    originalPrice: 156500,
    currency: "NGN",
    image: "/hero/accommodations.png",
    dealLabel: "10% off deal",
    propertyType: "Hotels",
    features: [
      { icon: "coffee", label: "Breakfast included" },
      { icon: "bed", label: "Suite" },
    ],
  },
  {
    id: "eko-hotels-results",
    name: "Eko Hotels & Suites",
    location: "Victoria Island",
    rating: 4.6,
    reviewCount: 12,
    price: 143500,
    originalPrice: 156500,
    currency: "NGN",
    image: "/hero/accommodations.png",
    dealLabel: "10% off deal",
    propertyType: "Hotels",
    features: [
      { icon: "coffee", label: "Breakfast included" },
      { icon: "bed", label: "Suite" },
    ],
  },
  {
    id: "eko-hotels-results",
    name: "Eko Hotels & Suites",
    location: "Victoria Island",
    rating: 4.6,
    reviewCount: 12,
    price: 143500,
    originalPrice: 156500,
    currency: "NGN",
    image: "/hero/accommodations.png",
    dealLabel: "10% off deal",
    propertyType: "Hotels",
    features: [
      { icon: "coffee", label: "Breakfast included" },
      { icon: "bed", label: "Suite" },
    ],
  },
  {
    id: "eko-hotels-results",
    name: "Eko Hotels & Suites",
    location: "Victoria Island",
    rating: 4.6,
    reviewCount: 12,
    price: 143500,
    originalPrice: 156500,
    currency: "NGN",
    image: "/hero/accommodations.png",
    dealLabel: "10% off deal",
    propertyType: "Hotels",
    features: [
      { icon: "coffee", label: "Breakfast included" },
      { icon: "bed", label: "Suite" },
    ],
  },
  {
    id: "eko-hotels-results",
    name: "Eko Hotels & Suites",
    location: "Victoria Island",
    rating: 4.6,
    reviewCount: 12,
    price: 143500,
    originalPrice: 156500,
    currency: "NGN",
    image: "/hero/accommodations.png",
    dealLabel: "10% off deal",
    propertyType: "Hotels",
    features: [
      { icon: "coffee", label: "Breakfast included" },
      { icon: "bed", label: "Suite" },
    ],
  },
  {
    id: "eko-hotels-results",
    name: "Eko Hotels & Suites",
    location: "Victoria Island",
    rating: 4.6,
    reviewCount: 12,
    price: 143500,
    originalPrice: 156500,
    currency: "NGN",
    image: "/hero/accommodations.png",
    dealLabel: "10% off deal",
    propertyType: "Hotels",
    features: [
      { icon: "coffee", label: "Breakfast included" },
      { icon: "bed", label: "Suite" },
    ],
  },
  {
    id: "eko-hotels-results",
    name: "Eko Hotels & Suites",
    location: "Victoria Island",
    rating: 4.6,
    reviewCount: 12,
    price: 143500,
    originalPrice: 156500,
    currency: "NGN",
    image: "/hero/accommodations.png",
    dealLabel: "10% off deal",
    propertyType: "Hotels",
    features: [
      { icon: "coffee", label: "Breakfast included" },
      { icon: "bed", label: "Suite" },
    ],
  },
];

export function countActiveFilters(filters: AccommodationFilterState): number {
  let count = 0;

  if (filters.location !== DEFAULT_ACCOMMODATION_FILTERS.location) count += 1;
  if (filters.discounts !== DEFAULT_ACCOMMODATION_FILTERS.discounts) count += 1;
  if (filters.priceBudget.trim()) count += 1;
  if (filters.priceRange) count += 1;
  if (filters.propertyType !== DEFAULT_ACCOMMODATION_FILTERS.propertyType) count += 1;
  if (filters.bedrooms) count += 1;
  if (filters.ratings) count += 1;
  if (filters.perks) count += 1;

  return count;
}

export function filterAccommodationResults(
  results: AccommodationResult[],
  filters: AccommodationFilterState,
  query: string,
): AccommodationResult[] {
  const normalizedQuery = query.trim().toLowerCase();

  return results.filter((result) => {
    if (
      normalizedQuery &&
      !`${result.name} ${result.location}`.toLowerCase().includes(normalizedQuery)
    ) {
      return false;
    }

    if (filters.propertyType && result.propertyType !== filters.propertyType) {
      return false;
    }

    if (filters.priceRange === "under-50k" && result.price >= 50000) return false;
    if (
      filters.priceRange === "50-150k" &&
      (result.price < 50000 || result.price > 150000)
    ) {
      return false;
    }
    if (filters.priceRange === "150k-plus" && result.price < 150000) return false;

    const budgetMax = Number.parseInt(
      filters.priceBudget.replace(/[^\d]/g, ""),
      10,
    );
    const effectiveMax =
      filters.priceBudget.trim() && !Number.isNaN(budgetMax)
        ? budgetMax
        : filters.priceMax;

    if (result.price < filters.priceMin || result.price > effectiveMax) return false;

    if (filters.ratings) {
      const minRating = Number.parseFloat(filters.ratings);
      if (!Number.isNaN(minRating) && result.rating < minRating) return false;
    }

    if (filters.bedrooms) {
      const hasBedroom = result.features.some((feature) =>
        feature.label.toLowerCase().includes(filters.bedrooms.toLowerCase()),
      );
      if (!hasBedroom && filters.bedrooms !== "Studio") return false;
    }

    if (filters.perks) {
      const hasPerk = result.features.some((feature) =>
        feature.label.toLowerCase().includes(filters.perks.toLowerCase()),
      );
      if (!hasPerk) return false;
    }

    return true;
  });
}
