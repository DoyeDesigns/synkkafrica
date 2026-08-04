import {
  DEFAULT_DISCOUNT_FILTER,
  matchesDiscountFilter,
} from "@/features/travel/data/discount-filter";

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

export const DEFAULT_CAR_RENTAL_FILTERS: CarRentalFilterState = {
  location: "Lagos Nigeria",
  discounts: DEFAULT_DISCOUNT_FILTER,
  priceBudget: "",
  priceMin: 50000,
  priceMax: 200000,
  priceRange: null,
  carType: "",
  serviceType: "Self drive",
  transmission: "Automatic",
  startDate: "",
  endDate: "",
};

export const CAR_TYPE_FILTER_OPTIONS = ["", "SUV", "Sedan", "Pickup"] as const;
export const CAR_TYPE_OPTIONS = ["SUV", "Sedan", "Hatchback", "Pickup"] as const;
export const SERVICE_TYPE_OPTIONS = ["Self drive", "Chauffeur"] as const;
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

  if (filters.location !== DEFAULT_CAR_RENTAL_FILTERS.location) count += 1;
  if (filters.discounts !== DEFAULT_CAR_RENTAL_FILTERS.discounts) count += 1;
  if (filters.priceBudget.trim()) count += 1;
  if (filters.priceRange) count += 1;
  if (filters.carType !== DEFAULT_CAR_RENTAL_FILTERS.carType) count += 1;
  if (filters.serviceType !== DEFAULT_CAR_RENTAL_FILTERS.serviceType) count += 1;
  if (filters.transmission !== DEFAULT_CAR_RENTAL_FILTERS.transmission) count += 1;
  if (filters.startDate.trim()) count += 1;
  if (filters.endDate.trim()) count += 1;

  return count;
}

export function filterCarRentalResults(
  results: CarRentalResult[],
  filters: CarRentalFilterState,
  query: string,
): CarRentalResult[] {
  const normalizedQuery = query.trim().toLowerCase();

  return results.filter((result) => {
    if (
      normalizedQuery &&
      !`${result.name} ${result.location} ${result.carType}`
        .toLowerCase()
        .includes(normalizedQuery)
    ) {
      return false;
    }

    if (
      filters.location !== DEFAULT_CAR_RENTAL_FILTERS.location &&
      !result.location.toLowerCase().includes(filters.location.toLowerCase()) &&
      !filters.location.toLowerCase().includes(result.location.toLowerCase())
    ) {
      return false;
    }

    if (filters.carType && result.carType !== filters.carType) {
      return false;
    }

    if (
      filters.serviceType !== DEFAULT_CAR_RENTAL_FILTERS.serviceType &&
      result.serviceType !== filters.serviceType
    ) {
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

    if (
      result.pricePerDay < filters.priceMin ||
      result.pricePerDay > effectiveMax
    ) {
      return false;
    }

    return true;
  });
}
