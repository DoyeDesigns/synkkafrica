"use client";

import { useCallback, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import type { SubmitReviewInput } from "@/features/account/data/account-reviews";
import {
  DEFAULT_CANCELLATION_WINDOW_HOURS,
  type AccountBooking,
  type BookingListTab,
} from "@/features/account/data/account-bookings";
import {
  cancelMyBooking,
  listMyBookings,
  type CustomerBookingApi,
} from "@/lib/api/users";
import { submitReview as submitListingReview } from "@/lib/api/reviews";

const FALLBACK_IMAGE = "/hero/accommodations.png";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

function toAccountBooking(
  b: CustomerBookingApi,
  userId: string,
  userEmail: string,
  reviewed: Set<string>,
): AccountBooking {
  return {
    id: b.id,
    userId,
    orderNumber: b.orderNumber,
    orderDate: formatDate(b.orderDate),
    experienceDate: b.experienceDate ?? "",
    experienceTime: b.experienceTime ?? undefined,
    totalAmount: b.totalAmount,
    currency: b.currency,
    title: b.title,
    description: b.description,
    location: b.location,
    rating: b.rating,
    reviewCount: b.reviewCount,
    image: b.image ?? FALLBACK_IMAGE,
    recipientEmail: userEmail,
    status: b.status,
    guestCount: b.guestCount,
    productType: (b.productType ??
      undefined) as AccountBooking["productType"],
    productId: b.listingId ?? undefined,
    cancellationWindowHours: DEFAULT_CANCELLATION_WINDOW_HOURS,
    reviewSubmitted: reviewed.has(b.id),
    cancelledAt: b.cancelledAt ? formatDate(b.cancelledAt) : undefined,
  };
}

// Reads the signed-in customer's real marketplace bookings. Guests / the
// design-preview session (no access token) simply see an empty list.
export function useAccountBookings(
  userId: string,
  userEmail: string,
  authorName = "Guest",
) {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const queryClient = useQueryClient();
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(
    () => new Set(),
  );

  const { data = [], isLoading } = useQuery({
    queryKey: ["account-bookings"],
    queryFn: () => listMyBookings(token as string),
    enabled: Boolean(token),
    refetchOnWindowFocus: false,
  });

  const bookings = useMemo<AccountBooking[]>(
    () => data.map((b) => toAccountBooking(b, userId, userEmail, reviewedIds)),
    [data, userId, userEmail, reviewedIds],
  );

  const ready = token ? !isLoading : true;

  const getBookingsByTab = useCallback(
    (tab: BookingListTab) => bookings.filter((b) => b.status === tab),
    [bookings],
  );

  const cancelBooking = useCallback(
    async (bookingId: string) => {
      if (!token) return;
      try {
        await cancelMyBooking(token, bookingId);
      } finally {
        queryClient.invalidateQueries({ queryKey: ["account-bookings"] });
      }
    },
    [token, queryClient],
  );

  const submitReview = useCallback(
    async (bookingId: string, input: SubmitReviewInput) => {
      const booking = bookings.find((item) => item.id === bookingId);
      if (!token || !booking?.productId) return;
      try {
        await submitListingReview(
          {
            listingId: booking.productId,
            rating: input.rating,
            comment: input.text,
            authorName,
            bookingId,
          },
          token,
        );
        setReviewedIds((prev) => new Set(prev).add(bookingId));
      } catch {
        // Surfaced by the modal's own error handling if wired; ignore here.
      }
    },
    [token, bookings, authorName],
  );

  const getBookingById = useCallback(
    (bookingId: string) =>
      bookings.find((booking) => booking.id === bookingId) ?? null,
    [bookings],
  );

  const counts = useMemo(
    () => ({
      upcoming: bookings.filter((b) => b.status === "upcoming").length,
      past: bookings.filter((b) => b.status === "past").length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
    }),
    [bookings],
  );

  return {
    bookings,
    ready,
    counts,
    getBookingsByTab,
    cancelBooking,
    submitReview,
    getBookingById,
  };
}
