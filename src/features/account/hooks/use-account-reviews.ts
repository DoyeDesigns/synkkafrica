"use client";

import { useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  SubmitReviewInput,
  UserAccountReview,
} from "@/features/account/data/account-reviews";
import type { BookingProductType } from "@/features/account/data/account-bookings";
import { listMyBookings } from "@/lib/api/users";
import {
  deleteMyReview,
  listMyReviews,
  submitReview as submitListingReview,
  type MyReviewApi,
} from "@/lib/api/reviews";

type PendingReviewBooking = {
  id: string;
  title: string;
  orderNumber: string;
  listingId: string | null;
};

function mapCategory(category: string | null): BookingProductType {
  if (category === "cars") return "car";
  if (category === "experiences") return "tour";
  return "accommodation";
}

function toUserReview(r: MyReviewApi, userId: string): UserAccountReview {
  return {
    id: r.id,
    userId,
    bookingId: r.bookingId ?? "",
    bookingReference: "",
    productId: r.listingId,
    productType: mapCategory(r.category),
    productName: r.listingTitle,
    rating: r.rating,
    text: r.comment ?? "",
    photos: [],
    submittedAt: r.createdAt,
    authorName: r.authorName ?? "",
  };
}

// The account "My reviews" page, backed by the customer's real reviews and
// past bookings (pending-review candidates).
export function useAccountReviews(
  userId: string,
  _userEmail: string,
  authorName: string,
) {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const queryClient = useQueryClient();

  const { data: rawReviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ["account-reviews"],
    queryFn: () => listMyReviews(token as string),
    enabled: Boolean(token),
    refetchOnWindowFocus: false,
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["account-bookings"],
    queryFn: () => listMyBookings(token as string),
    enabled: Boolean(token),
    refetchOnWindowFocus: false,
  });

  const reviews = useMemo(
    () => rawReviews.map((r) => toUserReview(r, userId)),
    [rawReviews, userId],
  );

  // Past bookings that don't yet have a review (matched by bookingId).
  const pendingReviewBookings = useMemo<PendingReviewBooking[]>(() => {
    const reviewedBookingIds = new Set(
      rawReviews.map((r) => r.bookingId).filter(Boolean),
    );
    return bookings
      .filter((b) => b.status === "past" && !reviewedBookingIds.has(b.id))
      .map((b) => ({
        id: b.id,
        title: b.title,
        orderNumber: b.orderNumber,
        listingId: b.listingId,
      }));
  }, [bookings, rawReviews]);

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["account-reviews"] });
    queryClient.invalidateQueries({ queryKey: ["account-bookings"] });
  }, [queryClient]);

  const submitReviewForBooking = useCallback(
    async (bookingId: string, input: SubmitReviewInput) => {
      const booking = pendingReviewBookings.find((b) => b.id === bookingId);
      if (!token || !booking?.listingId) return;
      try {
        await submitListingReview(
          {
            listingId: booking.listingId,
            rating: input.rating,
            comment: input.text,
            authorName,
            bookingId,
          },
          token,
        );
      } finally {
        invalidate();
      }
    },
    [token, pendingReviewBookings, authorName, invalidate],
  );

  const removeReview = useCallback(
    async (reviewId: string) => {
      if (!token) return;
      try {
        await deleteMyReview(token, reviewId);
      } finally {
        invalidate();
      }
    },
    [token, invalidate],
  );

  const ready = token ? !reviewsLoading && !bookingsLoading : true;

  return {
    ready,
    reviews,
    pendingReviewBookings,
    submitReviewForBooking,
    removeReview,
  };
}
