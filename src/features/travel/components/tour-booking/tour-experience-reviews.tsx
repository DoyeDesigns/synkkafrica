"use client";

import { ReviewsCarousel } from "@/features/travel/components/booking/reviews-carousel";
import { useTranslation } from "@/hooks/use-translation";
import type { TourDetail } from "@/features/travel/data/tour-booking";

type TourExperienceReviewsProps = {
  tour: TourDetail;
};

export function TourExperienceReviews({ tour }: TourExperienceReviewsProps) {
  const t = useTranslation();

  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold font-inter text-foreground">
        {t("account.reviews.experienceListingTitle")}
      </h2>
      <ReviewsCarousel
        productId={tour.id}
        reviews={[]}
        rating={tour.rating}
        reviewCount={tour.reviewCount}
      />
    </section>
  );
}
