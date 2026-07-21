"use client";

import { useCallback, useEffect, useState } from "react";

import type { SubmitReviewInput, UserAccountReview } from "@/features/account/data/account-reviews";
import {
  deleteAccountReview,
  submitAccountReview,
  syncReviewsFromBookings,
} from "@/features/account/data/account-reviews-store";
import {
  getBookingListTab,
  type AccountBooking,
} from "@/features/account/data/account-bookings";
import { loadUserBookings } from "@/features/account/data/account-bookings-store";

export function useAccountReviews(
  userId: string,
  userEmail: string,
  authorName: string,
) {
  const [reviews, setReviews] = useState<UserAccountReview[]>([]);
  const [bookings, setBookings] = useState<AccountBooking[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    const nextBookings = loadUserBookings(userId, userEmail);
    const nextReviews = syncReviewsFromBookings(userId, userEmail, authorName);
    setBookings(nextBookings);
    setReviews(nextReviews);
  }, [userId, userEmail, authorName]);

  useEffect(() => {
    refresh();
    setReady(true);
  }, [refresh]);

  const pendingReviewBookings = bookings.filter(
    (booking) =>
      getBookingListTab(booking) === "past" &&
      !booking.reviewSubmitted,
  );

  const submitReviewForBooking = useCallback(
    (bookingId: string, input: SubmitReviewInput) => {
      const booking = bookings.find((item) => item.id === bookingId);

      if (!booking) {
        return;
      }

      const next = submitAccountReview(userId, userEmail, authorName, booking, input);
      setReviews(next);
      setBookings(loadUserBookings(userId, userEmail));
    },
    [authorName, bookings, userEmail, userId],
  );

  const removeReview = useCallback(
    (reviewId: string) => {
      const next = deleteAccountReview(userId, userEmail, reviewId);
      setReviews(next);
      setBookings(loadUserBookings(userId, userEmail));
    },
    [userEmail, userId],
  );

  return {
    ready,
    reviews,
    pendingReviewBookings,
    submitReviewForBooking,
    removeReview,
    refresh,
  };
}
