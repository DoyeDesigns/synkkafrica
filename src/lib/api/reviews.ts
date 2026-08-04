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

// --- My reviews (customer account) ---

export type MyReviewApi = {
  id: string;
  bookingId: string | null;
  listingId: string;
  listingTitle: string;
  listingImage: string | null;
  category: string | null;
  authorName: string | null;
  rating: number;
  comment: string | null;
  status: string;
  createdAt: string;
};

export async function listMyReviews(token: string): Promise<MyReviewApi[]> {
  return apiFetch<MyReviewApi[]>("/reviews/mine", { token });
}

export async function deleteMyReview(
  token: string,
  id: string,
): Promise<void> {
  await apiFetch<void>(`/reviews/${id}`, { method: "DELETE", token });
}
