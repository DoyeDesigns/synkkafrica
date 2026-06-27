import {
  TOUR_EVENT_CATEGORIES,
  TOUR_EVENT_EXPERIENCES,
  TOUR_EVENTS,
  type TourEvent,
} from "@/features/travel/data/tours-landing";

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

export const TOUR_DISCOUNT_OPTIONS = [
  "All discounts",
  "With discount",
  "No discount",
] as const;

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
  location: "UAE, Dubai",
  discounts: TOUR_DISCOUNT_OPTIONS[0],
  priceBudget: "",
  priceMin: 10000,
  priceMax: 200000,
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

export function countActiveTourFilters(filters: TourFilterState): number {
  let count = 0;

  if (filters.location !== DEFAULT_TOUR_FILTERS.location) count += 1;
  if (filters.discounts !== DEFAULT_TOUR_FILTERS.discounts) count += 1;
  if (filters.priceBudget.trim()) count += 1;
  if (filters.priceRange) count += 1;
  if (filters.category !== DEFAULT_TOUR_FILTERS.category) count += 1;
  if (filters.experience !== DEFAULT_TOUR_FILTERS.experience) count += 1;

  return count;
}

export function filterTourResults(
  results: TourResult[],
  filters: TourFilterState,
  query: string,
): TourResult[] {
  const normalizedQuery = query.trim().toLowerCase();
  const normalizeLocation = (value: string) =>
    value.toLowerCase().replace(/,/g, "").replace(/\s+/g, " ").trim();

  return results.filter((result) => {
    if (
      normalizedQuery &&
      !`${result.title} ${result.description} ${result.location} ${result.city}`
        .toLowerCase()
        .includes(normalizedQuery)
    ) {
      return false;
    }

    if (filters.location.trim()) {
      const filterLocation = normalizeLocation(filters.location);
      const resultCity = normalizeLocation(result.city);
      const resultLocation = normalizeLocation(result.location);

      if (
        !resultCity.includes(filterLocation) &&
        !resultLocation.includes(filterLocation) &&
        !filterLocation.includes(resultCity)
      ) {
        return false;
      }
    }

    if (
      filters.discounts === "With discount" &&
      !result.hasDiscount
    ) {
      return false;
    }

    if (filters.discounts === "No discount" && result.hasDiscount) {
      return false;
    }

    if (
      filters.category !== "All categories" &&
      result.category !== filters.category
    ) {
      return false;
    }

    if (
      filters.experience !== "All experiences" &&
      result.experience !== filters.experience
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
