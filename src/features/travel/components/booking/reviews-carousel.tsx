"use client";

import { ChevronRight, Star } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { ReviewCount } from "@/components/review-count";
import { loadExperienceReviews } from "@/features/account/data/experience-reviews-store";
import { useExperienceReviews } from "@/features/account/hooks/use-experience-reviews";
import { AllReviewsModal } from "@/features/travel/components/booking/all-reviews-modal";
import { OPEN_PRODUCT_REVIEWS_EVENT } from "@/features/travel/booking/product-reviews-events";
import { useBookingContent } from "@/hooks/use-booking-content";
import { useTranslation } from "@/hooks/use-translation";
import type { PropertyReview } from "@/features/travel/data/property-booking";

type ReviewsCarouselProps = {
  productId: string;
  reviews: PropertyReview[];
  rating: number;
  reviewCount: number;
};

export function ReviewsCarousel({
  productId,
  reviews,
  rating,
  reviewCount,
}: ReviewsCarouselProps) {
  const t = useTranslation();
  const { labelReview } = useBookingContent();
  const { reviews: mergedReviews, rating: mergedRating, reviewCount: mergedCount } =
    useExperienceReviews(productId, reviews, rating, reviewCount);
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const fullStars = Math.floor(mergedRating);

  const guestReviewPhotos = useMemo(() => {
    const guestReviews = loadExperienceReviews(productId);
    return new Map(guestReviews.map((review) => [review.id, review.photos]));
  }, [productId, mergedReviews.length]);

  const activeReview = mergedReviews[activeIndex % Math.max(mergedReviews.length, 1)];

  useEffect(() => {
    const handleOpen = (event: Event) => {
      const detail = (event as CustomEvent<{ productId: string }>).detail;

      if (detail?.productId === productId) {
        setModalOpen(true);
      }
    };

    window.addEventListener(OPEN_PRODUCT_REVIEWS_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_PRODUCT_REVIEWS_EVENT, handleOpen);
  }, [productId]);

  const showNextReview = () => {
    setActiveIndex((current) => (current + 1) % mergedReviews.length);
  };

  if (!activeReview) return null;

  const activePhotos = guestReviewPhotos.get(activeReview.id) ?? [];

  return (
    <>
      <section className="rounded-xl bg-white p-5">
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="mb-4 flex w-full flex-wrap items-center gap-2 text-left text-sm font-satoshi transition-opacity hover:opacity-80"
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
            rating={mergedRating}
            reviewCount={mergedCount}
            className="font-medium text-foreground underline decoration-[#D85A30]/40 underline-offset-2"
          />
          <span className="rounded-full bg-[#FFF1EB] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#D85A30]">
            {t("account.reviews.listingBadge")}
          </span>
        </button>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="min-w-0 flex-1 space-y-3 overflow-hidden text-left transition-opacity hover:opacity-90"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#004785] text-sm font-bold font-montserrat text-white">
                {activeReview.avatarInitial}
              </span>
              <p className="text-sm font-bold font-montserrat text-foreground">
                {activeReview.author}
              </p>
            </div>
            <p className="line-clamp-3 text-sm leading-relaxed font-satoshi text-foreground">
              &ldquo;{labelReview(activeReview)}&rdquo;
            </p>

            {activePhotos.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {activePhotos.map((photo, index) => (
                  <div
                    key={`${activeReview.id}-photo-${index}`}
                    className="relative h-16 w-16 overflow-hidden rounded-lg border border-[#E5E5E5]"
                  >
                    <Image src={photo} alt="" fill className="object-cover" sizes="64px" />
                  </div>
                ))}
              </div>
            ) : null}

            {mergedCount > 0 ? (
              <span className="inline-block text-sm font-semibold font-inter text-[#004785] underline underline-offset-2">
                {t("booking.reviews.viewAll")}
              </span>
            ) : null}
          </button>

          {mergedReviews.length > 1 ? (
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

      <AllReviewsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        productId={productId}
        reviews={mergedReviews}
        rating={mergedRating}
        reviewCount={mergedCount}
      />
    </>
  );
}
