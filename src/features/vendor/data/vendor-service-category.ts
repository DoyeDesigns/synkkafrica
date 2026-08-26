import type { ListingCategory } from "@/features/vendor/data/vendor-add-listing";
import type {
  VendorListingCategory,
  VendorListingStatus,
} from "@/lib/api/vendor";

/** Statuses that mean the listing was admin-approved at least once. */
const APPROVED_STATUSES: VendorListingStatus[] = ["live", "paused"];

type ListingLike = {
  category: VendorListingCategory | ListingCategory;
  status: VendorListingStatus | string;
};

/**
 * One vendor, one service category — locked only after the first listing is
 * admin-approved (`live`). `paused` still counts (was approved earlier).
 * Draft / pending / rejected do not lock the category.
 */
export function getLockedCategoryFromListings(
  listings: ListingLike[],
): ListingCategory | null {
  const approved = listings.find((listing) =>
    APPROVED_STATUSES.includes(listing.status as VendorListingStatus),
  );

  return (approved?.category as ListingCategory | undefined) ?? null;
}
