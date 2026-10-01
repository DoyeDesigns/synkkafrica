import {
  DEFAULT_DISCOUNT_FILTER,
  matchesDiscountFilter,
} from "@/features/travel/data/discount-filter";
import {
  locationsOverlap,
  matchesSearchQuery,
} from "@/features/travel/data/location-match";

export type CarRentalResult = {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  pricePerDay: number;
  originalPricePerDay?: number;
  currency: string;
  image: string;
  carType: string;
  serviceType: string;
  transmission: string;
  selfDriveAvailable: boolean;
  hasDiscount: boolean;
};

export type CarRentalPriceRangeOption = "under-50k" | "50-150k" | "150k-plus";

export type CarRentalFilterState = {
  location: string;
  discounts: string;
  priceBudget: string;
  priceMin: number;
  priceMax: number;
  priceRange: CarRentalPriceRangeOption | null;
  carType: string;
  serviceType: string;
  transmission: string;
  startDate: string;
  endDate: string;
};

// Every select defaults to "" = "Any": nothing is filtered until the user
// picks a value (a concrete default like "Self drive" used to double as the
// "no filter" sentinel, so choosing it filtered nothing).
export const DEFAULT_CAR_RENTAL_FILTERS: CarRentalFilterState = {
  location: "",
  discounts: DEFAULT_DISCOUNT_FILTER,
  priceBudget: "",
  // Slider + budget start unconstrained. A finite ceiling here would hide
  // listings priced above it before the user touches the control.
  priceMin: 0,
  priceMax: Number.POSITIVE_INFINITY,
  priceRange: null,
  carType: "",
  serviceType: "Chauffeur",
  transmission: "Automatic",
  startDate: "",
  endDate: "",
};

export const CAR_TYPE_FILTER_OPTIONS = ["", "SUV", "Sedan", "Pickup"] as const;
export const CAR_TYPE_OPTIONS = ["SUV", "Sedan", "Hatchback", "Pickup", "Van"] as const;
export const SERVICE_TYPE_OPTIONS = ["Chauffeur"] as const;
export const TRANSMISSION_OPTIONS = ["Automatic", "Manual"] as const;

export const CAR_RENTAL_PRICE_RANGE_OPTIONS: {
  id: CarRentalPriceRangeOption;
  label: string;
}[] = [
  { id: "under-50k", label: "Under 50k" },
  { id: "50-150k", label: "50 - 150k" },
  { id: "150k-plus", label: "150k and above" },
];

const CAR_IMAGE = "/hero/car-rentals.png";

function buildCar(
  id: string,
  overrides: Partial<CarRentalResult> = {},
): CarRentalResult {
  const pricePerDay = overrides.pricePerDay ?? 143500;
  const hasDiscount =
    overrides.hasDiscount ?? Boolean(overrides.originalPricePerDay);

  return {
    id,
    name: "Toyota Highlander 2025",
    location: "Lekki Phase 1",
    rating: 4.6,
    reviewCount: 12,
    pricePerDay,
    currency: "NGN",
    image: CAR_IMAGE,
    carType: "SUV",
    serviceType: "Self drive",
    transmission: "Automatic",
    selfDriveAvailable: true,
    hasDiscount,
    ...overrides,
  };
}

export const CAR_RENTAL_RESULTS: CarRentalResult[] = [
  buildCar("highlander-lekki-1", { hasDiscount: true, originalPricePerDay: 165000 }),
  buildCar("highlander-lekki-2", { hasDiscount: false }),
  buildCar("highlander-vi-1", {
    location: "Victoria Island",
    hasDiscount: true,
    originalPricePerDay: 158000,
  }),
  buildCar("highlander-ikeja-1", { location: "Ikeja", hasDiscount: false }),
  buildCar("camry-lekki-1", {
    name: "Toyota Camry 2024",
    carType: "Sedan",
    pricePerDay: 95000,
    selfDriveAvailable: false,
    hasDiscount: true,
    originalPricePerDay: 110000,
  }),
  buildCar("rav4-lekki-1", {
    name: "Toyota RAV4 2025",
    pricePerDay: 128000,
    hasDiscount: false,
  }),
  buildCar("prado-abuja-1", {
    name: "Toyota Prado 2023",
    location: "Abuja",
    pricePerDay: 185000,
    hasDiscount: true,
    originalPricePerDay: 210000,
  }),
  buildCar("corolla-lekki-1", {
    name: "Toyota Corolla 2024",
    carType: "Sedan",
    pricePerDay: 72000,
    selfDriveAvailable: false,
    hasDiscount: false,
  }),
  buildCar("hilux-lekki-1", {
    name: "Toyota Hilux 2024",
    carType: "Pickup",
    pricePerDay: 156000,
    hasDiscount: true,
    originalPricePerDay: 175000,
  }),
  buildCar("highlander-lekki-3", { hasDiscount: false }),
  buildCar("highlander-lekki-4", {
    hasDiscount: true,
    originalPricePerDay: 160000,
  }),
  buildCar("highlander-lekki-5", { hasDiscount: false }),
];

export function countActiveCarRentalFilters(
  filters: CarRentalFilterState,
): number {
  let count = 0;

  if (filters.location.trim()) count += 1;
  if (filters.discounts !== DEFAULT_CAR_RENTAL_FILTERS.discounts) count += 1;
  if (filters.priceBudget.trim()) count += 1;
  if (filters.priceRange) count += 1;
  if (filters.carType !== DEFAULT_CAR_RENTAL_FILTERS.carType) count += 1;
  if (filters.transmission !== DEFAULT_CAR_RENTAL_FILTERS.transmission) count += 1;
  if (filters.startDate.trim()) count += 1;
  if (filters.endDate.trim()) count += 1;

  return count;
}

function sameOption(a: string, b: string) {
  const normalize = (value: string) =>
    value.trim().toLowerCase().replace(/[-_\s]+/g, " ");
  return normalize(a) === normalize(b);
}

// Body type keywords for listings that don't carry an explicit car type.
const CAR_TYPE_KEYWORDS: Record<(typeof CAR_TYPE_OPTIONS)[number], RegExp> = {
  SUV: /\b(suv|jeep|crossover|highlander|rav ?4|prado|land ?cruiser|lx ?\d{3}|gx ?\d{3}|rx ?\d{3}|venza|4runner|sequoia|fortuner|range ?rover|defender|discovery|evoque|velar|x[1-7]|q[3-8]|gl[abcse]?|g ?wagon|g ?class|ml ?\d{3}|escalade|tahoe|suburban|yukon|explorer|expedition|edge|escape|pathfinder|murano|rogue|x-?trail|patrol|armada|cr-?v|pilot|santa ?fe|tucson|palisade|sorento|sportage|telluride|cayenne|macan|touareg|tiguan|atlas|pajero|montero|outlander|grand ?cherokee|wrangler|durango|kluger)\b/i,
  Sedan: /\b(sedan|saloon|camry|corolla|avalon|accord|civic|elantra|sonata|altima|sentra|maxima|passat|jetta|e-?class|c-?class|s-?class|[3-7] ?series|a[4-8]|es ?\d{3}|is ?\d{3}|ls ?\d{3}|optima|k5|malibu|impala|fusion|mazda ?[36])\b/i,
  Hatchback: /\b(hatchback|hatch|yaris|golf|polo|fit|jazz|picanto|rio|i10|i20|swift|micra|fiesta|focus|mini|cooper|a3|1 ?series|auris)\b/i,
  Pickup: /\b(pick ?-?up|truck|hilux|tacoma|tundra|ranger|f-?150|f-?250|navara|frontier|l200|triton|d-?max|amarok|silverado|sierra|ram)\b/i,
  Van: /\b(van|minivan|minibus|bus|hiace|sienna|odyssey|previa|alphard|sprinter|v-?class|vito|transit|carnival|sedona|quest|caravan)\b/i,
};

// Infer a body type from the listing name/model. The backend doesn't store a
// car type yet, so without this every car-type filter returned zero results.
export function inferCarType(...parts: (string | null | undefined)[]): string {
  const text = parts.filter(Boolean).join(" ");
  if (!text) return "";
  for (const option of CAR_TYPE_OPTIONS) {
    if (CAR_TYPE_KEYWORDS[option].test(text)) return option;
  }
  return "";
}

export function filterCarRentalResults(
  results: CarRentalResult[],
  filters: CarRentalFilterState,
  query: string,
  // Converts a listing price into the display currency the budget (price
  // input / slider) is expressed in. Defaults to no conversion.
  toDisplay: (amount: number, currency: string) => number = (amount) => amount,
): CarRentalResult[] {
  return results.filter((result) => {
    if (
      !matchesSearchQuery(
        query,
        `${result.name} ${result.carType} ${result.transmission} ${result.serviceType}`,
        result.location,
      )
    ) {
      return false;
    }

    if (
      filters.location.trim() &&
      !locationsOverlap(filters.location, result.location)
    ) {
      return false;
    }

    if (filters.carType && !sameOption(result.carType, filters.carType)) {
      return false;
    }

    if (
      filters.transmission !== DEFAULT_CAR_RENTAL_FILTERS.transmission &&
      result.transmission !== filters.transmission
    ) {
      return false;
    }

    if (!matchesDiscountFilter(result.hasDiscount, filters.discounts)) {
      return false;
    }

    if (filters.priceRange === "under-50k" && result.pricePerDay >= 50000) {
      return false;
    }

    if (
      filters.priceRange === "50-150k" &&
      (result.pricePerDay < 50000 || result.pricePerDay > 150000)
    ) {
      return false;
    }

    if (filters.priceRange === "150k-plus" && result.pricePerDay < 150000) {
      return false;
    }

    const budgetMax = Number.parseInt(
      filters.priceBudget.replace(/[^\d]/g, ""),
      10,
    );
    const effectiveMax =
      filters.priceBudget.trim() && !Number.isNaN(budgetMax)
        ? budgetMax
        : filters.priceMax;

    // The budget is in the shopper's display currency (what cards show).
    const shownPrice = toDisplay(result.pricePerDay, result.currency);
    if (
      shownPrice < filters.priceMin ||
      shownPrice > effectiveMax
    ) {
      return false;
    }

    return true;
  });
}
