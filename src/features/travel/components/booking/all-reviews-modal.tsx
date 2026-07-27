"use client";

import { Star, X } from "lucide-react";
import { useEffect, useMemo } from "react";

import { ReviewCount } from "@/components/review-count";
import { ReviewPhotoGallery } from "@/components/review-photo-gallery";
import { loadExperienceReviews } from "@/features/account/data/experience-reviews-store";
import { useBookingContent } from "@/hooks/use-booking-content";
import { useTranslation } from "@/hooks/use-translation";
import type { PropertyReview } from "@/features/travel/data/property-booking";

type AllReviewsModalProps = {
  open: boolean;
  onClose: () => void;
  reviews: PropertyReview[];
  rating: number;
  reviewCount: number;
  productId: string;
};

function ReviewStars({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);

  return (
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
  );
}

export function AllReviewsModal({
  open,
  onClose,
  reviews,
  rating,
  reviewCount,
  productId,
}: AllReviewsModalProps) {
  const t = useTranslation();
  const { labelReview } = useBookingContent();

  const guestReviewPhotos = useMemo(() => {
    const guestReviews = loadExperienceReviews(productId);
    return new Map(guestReviews.map((review) => [review.id, review.photos]));
  }, [productId, open, reviews.length]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="all-reviews-title"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#E5E5E5] px-5 py-4 sm:px-6">
          <div className="space-y-2">
            <h2
              id="all-reviews-title"
              className="text-lg font-semibold font-inter text-foreground"
            >
              {t("booking.reviews.allReviews")}
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-sm font-satoshi">
              <ReviewStars rating={rating} />
              <ReviewCount
                rating={rating}
                reviewCount={reviewCount}
                className="font-medium text-foreground"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t("booking.reviews.close")}
            className="rounded-md p-1 text-[#676565] transition-colors hover:bg-[#F5F5F5] hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4 sm:px-6">
          {reviews.length === 0 ? (
            <p className="py-8 text-center text-sm font-medium font-inter text-[#9A9A9A]">
              {t("common.noReviewsYet")}
            </p>
          ) : (
            <ul className="space-y-4">
              {reviews.map((review) => {
                const photos = guestReviewPhotos.get(review.id) ?? [];

                return (
                  <li
                    key={review.id}
                    className="rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#004785] text-sm font-bold font-montserrat text-white">
                          {review.avatarInitial}
                        </span>
                        <div>
                          <p className="text-sm font-bold font-montserrat text-foreground">
                            {review.author}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <ReviewStars rating={review.rating} />
                            <span className="text-xs font-medium font-satoshi text-[#D85A30]">
                              {review.rating}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="mt-3 text-sm leading-relaxed font-satoshi text-foreground">
                      &ldquo;{labelReview(review)}&rdquo;
                    </p>

                    {photos.length > 0 ? (
                      <ReviewPhotoGallery photos={photos} className="mt-3" />
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
