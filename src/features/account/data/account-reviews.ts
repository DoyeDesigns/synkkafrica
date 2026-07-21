import type { BookingProductType } from "@/features/account/data/account-bookings";

export type UserAccountReview = {
  id: string;
  userId: string;
  bookingId: string;
  bookingReference: string;
  productId: string;
  productType: BookingProductType;
  productName: string;
  rating: number;
  text: string;
  photos: string[];
  submittedAt: string;
  authorName: string;
};

export type SubmitReviewInput = {
  rating: number;
  text: string;
  photos?: string[];
};

export function formatReviewLabels(submittedAt: string) {
  const date = new Date(submittedAt);

  return {
    time: new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(date),
    date: new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    })
      .format(date)
      .toUpperCase(),
  };
}

export function createUserAccountReviewId(bookingId: string) {
  return `review-${bookingId}`;
}
