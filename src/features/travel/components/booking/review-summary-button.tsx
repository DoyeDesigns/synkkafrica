"use client";

import { Star } from "lucide-react";

import { ReviewCount } from "@/components/review-count";
import { openProductReviews } from "@/features/travel/booking/product-reviews-events";
import { useTranslation } from "@/hooks/use-translation";

type ReviewSummaryButtonProps = {
  productId: string;
  rating: number;
  reviewCount: number;
  className?: string;
};

export function ReviewSummaryButton({
  productId,
  rating,
  reviewCount,
  className = "",
}: ReviewSummaryButtonProps) {
  const t = useTranslation();
  const fullStars = Math.floor(rating);

  return (
    <button
      type="button"
      onClick={() => openProductReviews(productId)}
      aria-label={t("booking.reviews.viewAll")}
      className={`inline-flex flex-wrap items-center gap-2 text-sm font-satoshi transition-opacity hover:opacity-80 ${className}`}
    >
      <span className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={`h-3.5 w-3.5 ${
              index < fullStars
                ? "fill-amber-400 text-amber-400"
                : "fill-zinc-200 text-zinc-200"
            }`}
          />
        ))}
      </span>
      <ReviewCount
        rating={rating}
        reviewCount={reviewCount}
        className="font-medium text-foreground underline decoration-[#D85A30]/40 underline-offset-2"
      />
    </button>
  );
}
