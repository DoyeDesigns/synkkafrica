import type { VendorDashboardListing } from "@/features/vendor/data/vendor-dashboard";
import type { ListingCategory } from "@/features/vendor/data/vendor-add-listing";

export const VENDOR_LISTINGS_PAGE_ITEMS: VendorDashboardListing[] = [
  {
    id: "lekki-garden-suites",
    title: "Lekki Garden Suites",
    category: "Accommodations",
    categoryKey: "vendor.dashboard.category.accommodations",
    rating: 5,
    image: "/hero/accommodations.png",
    status: "live",
  },
  {
    id: "victoria-island-loft",
    title: "Victoria Island Loft",
    category: "Accommodations",
    categoryKey: "vendor.dashboard.category.accommodations",
    rating: 4,
    image: "/hero/accommodations.png",
    status: "paused",
  },
  {
    id: "toyota-camry-2021",
    title: "Toyota Camry 2021",
    category: "Car rentals",
    categoryKey: "vendor.dashboard.category.carRentals",
    rating: 0,
    image: "/hero/car-rentals.png",
    status: "pending",
  },
  {
    id: "lagos-lagoon-sunset-cruise",
    title: "Lagos Lagoon Sunset Cruise",
    category: "Tours & experiences",
    categoryKey: "vendor.dashboard.category.toursExperiences",
    rating: 5,
    image: "/destinations/lagos.png",
    status: "live",
  },
];

const CATEGORY_KEY_TO_LISTING_CATEGORY: Record<
  VendorDashboardListing["categoryKey"],
  ListingCategory
> = {
  "vendor.dashboard.category.accommodations": "accommodations",
  "vendor.dashboard.category.carRentals": "cars",
  "vendor.dashboard.category.tours": "experiences",
  "vendor.dashboard.category.toursExperiences": "experiences",
};

/** One vendor, one service category — set on first saved listing. */
export { getVendorServiceCategory as getVendorLockedListingCategory } from "@/features/vendor/data/vendor-service-category";

export function getVendorListingById(listingId: string) {
  return VENDOR_LISTINGS_PAGE_ITEMS.find((listing) => listing.id === listingId);
}

export function mapListingCategoryKey(
  categoryKey: VendorDashboardListing["categoryKey"],
): ListingCategory {
  return CATEGORY_KEY_TO_LISTING_CATEGORY[categoryKey];
}
