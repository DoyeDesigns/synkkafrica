"use client";

import { ChevronRight, Star } from "lucide-react";
import { useState } from "react";

import { ReviewCount } from "@/components/review-count";
import { useBookingContent } from "@/hooks/use-booking-content";
import { useTranslation } from "@/hooks/use-translation";
import type { PropertyReview } from "@/features/travel/data/property-booking";

type ReviewsCarouselProps = {
  reviews: PropertyReview[];
  rating: number;
  reviewCount: number;
};

export function ReviewsCarousel({
  reviews,
  rating,
  reviewCount,
}: ReviewsCarouselProps) {
  const t = useTranslation();
  const { labelReview } = useBookingContent();
  const [activeIndex, setActiveIndex] = useState(0);
  const fullStars = Math.floor(rating);
  const activeReview = reviews[activeIndex];

  const showNextReview = () => {
    setActiveIndex((current) => (current + 1) % reviews.length);
  };

  if (!activeReview) return null;

  return (
    <section className="rounded-xl bg-white p-5">
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm font-satoshi">
        <div className="flex items-center gap-0.5">
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
        </div>
        <ReviewCount
          rating={rating}
          reviewCount={reviewCount}
          className="font-medium text-foreground"
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="min-w-0 flex-1 space-y-3 overflow-hidden">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#004785] text-sm font-bold font-montserrat text-white">
              {activeReview.avatarInitial}
            </span>
            <p className="text-sm font-bold font-montserrat text-foreground">
              {activeReview.author}
            </p>
          </div>
          <p className="text-sm leading-relaxed font-satoshi text-foreground">
            &ldquo;{labelReview(activeReview)}&rdquo;
          </p>
        </div>

        {reviews.length > 1 ? (
          <button
            type="button"
            onClick={showNextReview}
            aria-label={t("booking.reviews.nextReview")}
            className="shrink-0 text-foreground transition-opacity hover:opacity-70"
          >
            <ChevronRight className="size-8 text-[#6B6B6B]" strokeWidth={2} />
          </button>
        ) : null}
      </div>
    </section>
  );
}
