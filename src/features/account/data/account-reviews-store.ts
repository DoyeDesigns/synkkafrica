"use client";

import type { SubmitReviewInput, UserAccountReview } from "@/features/account/data/account-reviews";
import {
  createUserAccountReviewId,
  formatReviewLabels,
} from "@/features/account/data/account-reviews";
import type { AccountBooking } from "@/features/account/data/account-bookings";
import {
  loadUserBookings,
  saveUserBookings,
} from "@/features/account/data/account-bookings-store";
import { publishExperienceReview } from "@/features/account/data/experience-reviews-store";

const STORAGE_PREFIX = "synk-account-reviews";

function getStorageKey(userId: string) {
  return `${STORAGE_PREFIX}:${userId}`;
}

function readStoredReviews(userId: string): UserAccountReview[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = localStorage.getItem(getStorageKey(userId));

  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as UserAccountReview[];
  } catch {
    return [];
  }
}

function writeStoredReviews(userId: string, reviews: UserAccountReview[]) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(getStorageKey(userId), JSON.stringify(reviews));
}

export function loadUserAccountReviews(userId: string): UserAccountReview[] {
  return readStoredReviews(userId).sort(
    (left, right) =>
      new Date(right.submittedAt).getTime() - new Date(left.submittedAt).getTime(),
  );
}

export function syncReviewsFromBookings(
  userId: string,
  userEmail: string,
  authorName: string,
): UserAccountReview[] {
  const bookings = loadUserBookings(userId, userEmail);
  const existing = readStoredReviews(userId);
  const existingByBooking = new Map(existing.map((review) => [review.bookingId, review]));

  const fromBookings = bookings
    .filter((booking) => booking.reviewSubmitted && booking.userReview)
    .map((booking) => {
      const submittedAt = booking.userReview!.submittedAt;
      const reviewId = createUserAccountReviewId(booking.id);

      return {
        id: reviewId,
        userId,
        bookingId: booking.id,
        bookingReference: booking.orderNumber,
        productId: booking.productId ?? booking.id,
        productType: booking.productType ?? "tour",
        productName: booking.title,
        rating: booking.userReview!.rating,
        text: booking.userReview!.text,
        photos: booking.userReview!.photos ?? [],
        submittedAt,
        authorName,
      } satisfies UserAccountReview;
    });

  const merged = [...fromBookings];

  for (const review of existing) {
    if (!merged.some((item) => item.bookingId === review.bookingId)) {
      merged.push(review);
    }
  }

  writeStoredReviews(userId, merged);
  return merged.sort(
    (left, right) =>
      new Date(right.submittedAt).getTime() - new Date(left.submittedAt).getTime(),
  );
}

export function submitAccountReview(
  userId: string,
  userEmail: string,
  authorName: string,
  booking: AccountBooking,
  input: SubmitReviewInput,
): UserAccountReview[] {
  const submittedAt = new Date().toISOString().split("T")[0] ?? "";
  const photos = input.photos ?? [];
  const productId = booking.productId ?? booking.id;

  const bookings = loadUserBookings(userId, userEmail).map((item) =>
    item.id === booking.id
      ? {
          ...item,
          reviewSubmitted: true,
          userReview: {
            rating: input.rating,
            text: input.text,
            photos,
            submittedAt,
          },
        }
      : item,
  );

  saveUserBookings(userId, bookings);

  const review: UserAccountReview = {
    id: createUserAccountReviewId(booking.id),
    userId,
    bookingId: booking.id,
    bookingReference: booking.orderNumber,
    productId,
    productType: booking.productType ?? "tour",
    productName: booking.title,
    rating: input.rating,
    text: input.text,
    photos,
    submittedAt,
    authorName,
  };

  const existing = readStoredReviews(userId).filter(
    (item) => item.bookingId !== booking.id,
  );
  const next = [review, ...existing];
  writeStoredReviews(userId, next);

  publishExperienceReview({
    productId,
    author: authorName,
    avatarInitial: authorName.charAt(0).toUpperCase() || "G",
    rating: input.rating,
    text: input.text,
    photos,
    submittedAt,
    source: "guest",
  });

  return next;
}

export function deleteAccountReview(
  userId: string,
  userEmail: string,
  reviewId: string,
): UserAccountReview[] {
  const reviews = readStoredReviews(userId);
  const target = reviews.find((review) => review.id === reviewId);

  if (!target) {
    return reviews;
  }

  const bookings = loadUserBookings(userId, userEmail).map((booking) =>
    booking.id === target.bookingId
      ? {
          ...booking,
          reviewSubmitted: false,
          userReview: undefined,
        }
      : booking,
  );

  saveUserBookings(userId, bookings);
  const next = reviews.filter((review) => review.id !== reviewId);
  writeStoredReviews(userId, next);
  return next;
}

export { formatReviewLabels };
