import {
  TOUR_EVENT_CATEGORIES,
  TOUR_EVENT_EXPERIENCES,
  TOUR_EVENTS,
  type TourEvent,
} from "@/features/travel/data/tours-landing";
import {
  DEFAULT_DISCOUNT_FILTER,
  DISCOUNT_FILTER_OPTIONS,
  matchesDiscountFilter,
} from "@/features/travel/data/discount-filter";
import {
  locationsOverlap,
  matchesSearchQuery,
} from "@/features/travel/data/location-match";

export type TourResult = TourEvent & {
  hasDiscount: boolean;
};

export type TourPriceRangeOption = "under-50k" | "50-150k" | "150k-plus";

export type TourFilterState = {
  location: string;
  discounts: string;
  priceBudget: string;
  priceMin: number;
  priceMax: number;
  priceRange: TourPriceRangeOption | null;
  category: string;
  experience: string;
};

export const TOUR_DISCOUNT_OPTIONS = DISCOUNT_FILTER_OPTIONS;

export const TOUR_CATEGORY_OPTIONS = TOUR_EVENT_CATEGORIES.filter(
  (option) => option !== "All categories",
);

export const TOUR_EXPERIENCE_OPTIONS = TOUR_EVENT_EXPERIENCES.filter(
  (option) => option !== "All experiences",
);

export const TOUR_PRICE_RANGE_OPTIONS: {
  id: TourPriceRangeOption;
  label: string;
}[] = [
  { id: "under-50k", label: "Under 50k" },
  { id: "50-150k", label: "50 - 150k" },
  { id: "150k-plus", label: "150k and above" },
];

export const TOUR_CATEGORY_FILTER_OPTIONS = [
  "All categories",
  ...TOUR_CATEGORY_OPTIONS,
] as const;

export const TOUR_EXPERIENCE_FILTER_OPTIONS = [
  "All experiences",
  ...TOUR_EXPERIENCE_OPTIONS,
] as const;

export const DEFAULT_TOUR_FILTERS: TourFilterState = {
  // "" means "any"; price bounds start open so nothing is hidden by default.
  location: "",
  discounts: DEFAULT_DISCOUNT_FILTER,
  priceBudget: "",
  priceMin: 0,
  priceMax: Number.POSITIVE_INFINITY,
  priceRange: null,
  category: TOUR_CATEGORY_FILTER_OPTIONS[0],
  experience: TOUR_EXPERIENCE_FILTER_OPTIONS[0],
};

function expandTourResults(events: TourEvent[]): TourResult[] {
  const expanded: TourResult[] = [];

  events.forEach((event, index) => {
    expanded.push({
      ...event,
      hasDiscount: index % 3 === 0,
    });

    if (index < 8) {
      expanded.push({
        ...event,
        id: `${event.id}-result-${index}`,
        hasDiscount: index % 2 === 0,
      });
    }
  });

  return expanded;
}

export const TOUR_RESULTS: TourResult[] = expandTourResults(TOUR_EVENTS);

function sameOption(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

// "" and the explicit "All …" option both mean "no filter".
function isAllOption(value: string, allOption: string) {
  return !value.trim() || sameOption(value, allOption);
}

export function countActiveTourFilters(filters: TourFilterState): number {
  let count = 0;

  if (filters.location.trim()) count += 1;
  if (filters.discounts !== DEFAULT_TOUR_FILTERS.discounts) count += 1;
  if (filters.priceBudget.trim()) count += 1;
  if (filters.priceRange) count += 1;
  if (!isAllOption(filters.category, "All categories")) count += 1;
  if (!isAllOption(filters.experience, "All experiences")) count += 1;

  return count;
}

export function filterTourResults(
  results: TourResult[],
  filters: TourFilterState,
  query: string,
): TourResult[] {
  return results.filter((result) => {
    if (
      !matchesSearchQuery(
        query,
        `${result.title} ${result.description} ${result.category} ${result.experience}`,
        `${result.location} ${result.city}`,
      )
    ) {
      return false;
    }

    if (
      filters.location.trim() &&
      !locationsOverlap(filters.location, result.city) &&
      !locationsOverlap(filters.location, result.location)
    ) {
      return false;
    }

    if (!matchesDiscountFilter(result.hasDiscount, filters.discounts)) {
      return false;
    }

    if (
      !isAllOption(filters.category, "All categories") &&
      !sameOption(result.category, filters.category)
    ) {
      return false;
    }

    if (
      !isAllOption(filters.experience, "All experiences") &&
      !sameOption(result.experience, filters.experience)
    ) {
      return false;
    }

    if (filters.priceRange === "under-50k" && result.price >= 50000) {
      return false;
    }

    if (
      filters.priceRange === "50-150k" &&
      (result.price < 50000 || result.price > 150000)
    ) {
      return false;
    }

    if (filters.priceRange === "150k-plus" && result.price < 150000) {
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

    if (result.price < filters.priceMin || result.price > effectiveMax) {
      return false;
    }

    return true;
  });
}
