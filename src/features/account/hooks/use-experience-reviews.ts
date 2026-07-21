"use client";

import { useEffect, useMemo, useState } from "react";

import {
  getExperienceReviewAggregate,
  loadExperienceReviews,
  type ExperienceListingReview,
} from "@/features/account/data/experience-reviews-store";
import type { PropertyReview } from "@/features/travel/data/property-booking";

export function useExperienceReviews(
  productId: string,
  staticReviews: PropertyReview[],
  staticRating: number,
  staticReviewCount: number,
) {
  const [guestReviews, setGuestReviews] = useState<ExperienceListingReview[]>([]);

  useEffect(() => {
    setGuestReviews(loadExperienceReviews(productId));

    const handleUpdate = (event: Event) => {
      const detail = (event as CustomEvent<{ productId: string }>).detail;

      if (!detail || detail.productId === productId) {
        setGuestReviews(loadExperienceReviews(productId));
      }
    };

    window.addEventListener("synk-experience-reviews-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("synk-experience-reviews-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [productId]);

  return useMemo(
    () => getExperienceReviewAggregate(productId, staticReviews, staticRating, staticReviewCount),
    [productId, staticReviews, staticRating, staticReviewCount, guestReviews],
  );
}
