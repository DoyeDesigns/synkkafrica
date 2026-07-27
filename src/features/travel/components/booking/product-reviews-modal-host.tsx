"use client";

import { useEffect, useState } from "react";

import { useExperienceReviews } from "@/features/account/hooks/use-experience-reviews";
import { AllReviewsModal } from "@/features/travel/components/booking/all-reviews-modal";
import { OPEN_PRODUCT_REVIEWS_EVENT } from "@/features/travel/booking/product-reviews-events";
import type { PropertyReview } from "@/features/travel/data/property-booking";

type ProductReviewsModalHostProps = {
  productId: string;
  reviews?: PropertyReview[];
  rating: number;
  reviewCount: number;
};

export function ProductReviewsModalHost({
  productId,
  reviews = [],
  rating,
  reviewCount,
}: ProductReviewsModalHostProps) {
  const [open, setOpen] = useState(false);
  const { reviews: mergedReviews, rating: mergedRating, reviewCount: mergedCount } =
    useExperienceReviews(productId, reviews, rating, reviewCount);

  useEffect(() => {
    const handleOpen = (event: Event) => {
      const detail = (event as CustomEvent<{ productId: string }>).detail;

      if (detail?.productId === productId) {
        setOpen(true);
      }
    };

    window.addEventListener(OPEN_PRODUCT_REVIEWS_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_PRODUCT_REVIEWS_EVENT, handleOpen);
  }, [productId]);

  return (
    <AllReviewsModal
      open={open}
      onClose={() => setOpen(false)}
      productId={productId}
      reviews={mergedReviews}
      rating={mergedRating}
      reviewCount={mergedCount}
    />
  );
}
