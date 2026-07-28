export const DISCOUNT_FILTER_OPTIONS = [
  "All discounts",
  "With discount",
  "No discount",
] as const;

export type DiscountFilterOption = (typeof DISCOUNT_FILTER_OPTIONS)[number];

export const DEFAULT_DISCOUNT_FILTER: DiscountFilterOption =
  DISCOUNT_FILTER_OPTIONS[0];

export function matchesDiscountFilter(
  hasDiscount: boolean,
  filter: string,
): boolean {
  if (filter === "With discount" && !hasDiscount) {
    return false;
  }

  if (filter === "No discount" && hasDiscount) {
    return false;
  }

  return true;
}

export function isDiscountFilterActive(
  filter: string,
  defaultFilter: string = DEFAULT_DISCOUNT_FILTER,
): boolean {
  return filter !== defaultFilter;
}
