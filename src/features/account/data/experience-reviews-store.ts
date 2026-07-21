"use client";

import type { PropertyReview } from "@/features/travel/data/property-booking";

export type ExperienceListingReview = {
  id: string;
  productId: string;
  author: string;
  avatarInitial: string;
  rating: number;
  text: string;
  photos: string[];
  submittedAt: string;
  source: "guest" | "synkkafrica";
};

const STORAGE_PREFIX = "synk-experience-reviews";

function getStorageKey(productId: string) {
  return `${STORAGE_PREFIX}:${productId}`;
}

function readProductReviews(productId: string): ExperienceListingReview[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = localStorage.getItem(getStorageKey(productId));

  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as ExperienceListingReview[];
  } catch {
    return [];
  }
}

function writeProductReviews(productId: string, reviews: ExperienceListingReview[]) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(getStorageKey(productId), JSON.stringify(reviews));
}

export function loadExperienceReviews(productId: string): ExperienceListingReview[] {
  return readProductReviews(productId).sort(
    (left, right) =>
      new Date(right.submittedAt).getTime() - new Date(left.submittedAt).getTime(),
  );
}

export function publishExperienceReview(
  review: Omit<ExperienceListingReview, "id">,
): ExperienceListingReview[] {
  const existing = readProductReviews(review.productId);
  const nextReview: ExperienceListingReview = {
    ...review,
    id: `exp-review-${Date.now()}`,
  };
  const next = [nextReview, ...existing];
  writeProductReviews(review.productId, next);

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("synk-experience-reviews-updated", {
        detail: { productId: review.productId },
      }),
    );
  }

  return next;
}

export function experienceReviewToPropertyReview(
  review: ExperienceListingReview,
): PropertyReview {
  return {
    id: review.id,
    author: review.author,
    avatarInitial: review.avatarInitial,
    rating: review.rating,
    text: review.text,
  };
}

export function getExperienceReviewAggregate(
  productId: string,
  staticReviews: PropertyReview[],
  staticRating: number,
  staticReviewCount: number,
) {
  const guestReviews = loadExperienceReviews(productId);
  const merged = [
    ...guestReviews.map(experienceReviewToPropertyReview),
    ...staticReviews,
  ];

  if (merged.length === 0) {
    return {
      reviews: staticReviews,
      rating: staticRating,
      reviewCount: staticReviewCount,
    };
  }

  const totalRating = merged.reduce((sum, review) => sum + review.rating, 0);
  const rating = Math.round((totalRating / merged.length) * 10) / 10;

  return {
    reviews: merged,
    rating,
    reviewCount: merged.length,
  };
}
