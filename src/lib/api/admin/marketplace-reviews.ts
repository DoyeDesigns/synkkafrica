import { apiFetch } from "@/lib/api/backend";

export type MarketplaceReviewStatus = "published" | "hidden";

export type MarketplaceReview = {
  id: string;
  status: MarketplaceReviewStatus;
  rating: number;
  comment: string | null;
  createdAt: string;
  listingId: string;
  listingTitle: string | null;
  listingCategory: string | null;
  listingImage: string | null;
  vendorId: string;
  vendorName: string | null;
  bookingId: string | null;
  bookingReference: string | null;
  customerUserId: string | null;
  customerName: string | null;
  customerEmail: string | null;
};

// GET /admin/marketplace-reviews — all statuses, newest first, capped.
// Hide/publish use adminHideReview / adminPublishReview in ../admin.ts.
export async function listMarketplaceReviews(
  token: string,
): Promise<MarketplaceReview[]> {
  return apiFetch<MarketplaceReview[]>("/admin/marketplace-reviews", { token });
}
