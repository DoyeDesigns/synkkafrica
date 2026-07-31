import { apiFetch } from "@/lib/api/backend";

export type ReviewApi = {
  id: string;
  authorName: string | null;
  rating: number;
  comment: string | null;
  createdAt: string;
};

export type SubmitReviewInput = {
  listingId: string;
  rating: number;
  comment?: string;
  authorName?: string;
  bookingId?: string;
};

export async function listReviews(listingId: string): Promise<ReviewApi[]> {
  return apiFetch<ReviewApi[]>(
    `/reviews?listingId=${encodeURIComponent(listingId)}`,
  );
}

export async function submitReview(
  input: SubmitReviewInput,
  token?: string,
): Promise<ReviewApi> {
  return apiFetch<ReviewApi>("/reviews", {
    method: "POST",
    token,
    body: input,
  });
}
