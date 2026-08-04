import type { ListingCategory } from "@/features/vendor/data/vendor-add-listing";

const STORAGE_KEY = "synkafrica-vendor-service-category";

const VALID_CATEGORIES: ListingCategory[] = ["cars", "accommodations", "experiences"];

function isListingCategory(value: string | null): value is ListingCategory {
  return value !== null && VALID_CATEGORIES.includes(value as ListingCategory);
}

/** Returns the vendor's saved service category, or null if not chosen yet. */
export function getVendorServiceCategory(): ListingCategory | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  return isListingCategory(stored) ? stored : null;
}

/** Persists the vendor's one-time service category choice. */
export function setVendorServiceCategory(category: ListingCategory): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, category);
  window.dispatchEvent(new Event("vendor-service-category-change"));
}
