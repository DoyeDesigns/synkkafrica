"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  cancelUserBooking,
  loadUserBookings,
  rememberActiveAccountUser,
  saveUserBookings,
  syncConfirmationToUserBookings,
} from "@/features/account/data/account-bookings-store";
import type { SubmitReviewInput } from "@/features/account/data/account-reviews";
import { submitAccountReview } from "@/features/account/data/account-reviews-store";
import {
  getBookingListTab,
  refreshBookingStatuses,
  type AccountBooking,
  type BookingListTab,
} from "@/features/account/data/account-bookings";
import { getStoredBookingConfirmation } from "@/features/travel/booking/booking-confirmation";

export function useAccountBookings(
  userId: string,
  userEmail: string,
  authorName = "Guest",
) {
  const [bookings, setBookings] = useState<AccountBooking[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    rememberActiveAccountUser(userId, userEmail);

    let next = loadUserBookings(userId, userEmail);
    const latestConfirmation = getStoredBookingConfirmation();

    if (latestConfirmation) {
      next = syncConfirmationToUserBookings(userId, userEmail, latestConfirmation);
    }

    setBookings(next);
    setReady(true);
  }, [userId, userEmail]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    const interval = window.setInterval(() => {
      setBookings((current) => refreshBookingStatuses(current));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [ready]);

  const getBookingsByTab = useCallback(
    (tab: BookingListTab) =>
      bookings.filter((booking) => getBookingListTab(booking) === tab),
    [bookings],
  );

  const cancelBooking = useCallback(
    (bookingId: string) => {
      const next = cancelUserBooking(userId, userEmail, bookingId);
      setBookings(next);
    },
    [userId, userEmail],
  );

  const submitReview = useCallback(
    (bookingId: string, input: SubmitReviewInput) => {
      const booking = bookings.find((item) => item.id === bookingId);

      if (!booking) {
        return;
      }

      submitAccountReview(userId, userEmail, authorName, booking, input);
      setBookings(loadUserBookings(userId, userEmail));
    },
    [authorName, bookings, userEmail, userId],
  );

  const getBookingById = useCallback(
    (bookingId: string) => bookings.find((booking) => booking.id === bookingId) ?? null,
    [bookings],
  );

  const counts = useMemo(
    () => ({
      upcoming: getBookingsByTab("upcoming").length,
      past: getBookingsByTab("past").length,
      cancelled: getBookingsByTab("cancelled").length,
    }),
    [getBookingsByTab],
  );

  return {
    bookings,
    ready,
    counts,
    getBookingsByTab,
    cancelBooking,
    submitReview,
    getBookingById,
    refresh: () => setBookings(loadUserBookings(userId, userEmail)),
    persist: (next: AccountBooking[]) => {
      saveUserBookings(userId, next);
      setBookings(next);
    },
  };
}
