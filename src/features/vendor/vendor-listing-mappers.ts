import type { VendorDashboardListing } from "@/features/vendor/data/vendor-dashboard";
import type {
  VendorListingCategory,
  VendorListingSummary,
} from "@/lib/api/vendor";

export const VENDOR_CATEGORY_KEY: Record<
  VendorListingCategory,
  VendorDashboardListing["categoryKey"]
> = {
  cars: "vendor.dashboard.category.carRentals",
  accommodations: "vendor.dashboard.category.accommodations",
  experiences: "vendor.dashboard.category.toursExperiences",
};

const CATEGORY_LABEL: Record<VendorListingCategory, string> = {
  cars: "Car rentals",
  accommodations: "Accommodations",
  experiences: "Tours & experiences",
};

// Backend listing summary → the card's view model. The backend's five
// statuses map 1:1 onto the card's statuses.
export function toVendorDashListing(
  l: VendorListingSummary,
): VendorDashboardListing {
  return {
    id: l.id,
    title: l.title,
    category: CATEGORY_LABEL[l.category],
    categoryKey: VENDOR_CATEGORY_KEY[l.category],
    rating: Math.round(l.ratingAvg),
    // Empty when no cover has been uploaded → the card shows a category-icon
    // placeholder rather than a cropped hero banner.
    image: l.coverImageUrl || "",
    status: l.status,
    rejectionReason: l.rejectionReason ?? null,
  };
}
