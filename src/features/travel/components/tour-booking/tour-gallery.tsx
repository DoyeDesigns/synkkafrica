"use client";

import { Heart, MapPin, Star } from "lucide-react";

import { BookingImageGallery } from "@/features/travel/components/booking/booking-image-gallery";
import { ReviewSummaryButton } from "@/features/travel/components/booking/review-summary-button";
import { useBookingContent } from "@/hooks/use-booking-content";
import { useTranslation } from "@/hooks/use-translation";
import type { TourDetail } from "@/features/travel/data/tour-booking";

type TourGalleryProps = {
  tour: TourDetail;
};

export function TourGallery({ tour }: TourGalleryProps) {
  const t = useTranslation();

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <ReviewSummaryButton
          productId={tour.id}
          rating={tour.rating}
          reviewCount={tour.reviewCount}
        />

        <h1 className="text-2xl font-bold font-montserrat text-foreground sm:text-[28px]">
          {tour.title}
        </h1>

        <p className="inline-flex items-center gap-1.5 text-sm font-medium font-satoshi text-foreground">
          <MapPin className="h-4 w-4 shrink-0 text-[#2F2F2F]" strokeWidth={1.5} />
          {tour.location}
        </p>
      </div>

      <BookingImageGallery
        images={tour.images}
        alt={tour.title}
        extraPhotoCount={Math.max(0, tour.images.length - 5)}
        overlay={
          <button
            type="button"
            aria-label={t("booking.tour.saveTour")}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm"
          >
            <Heart className="h-5 w-5 text-foreground" strokeWidth={1.5} />
          </button>
        }
      />
    </div>
  );
}

type AboutThisTourProps = {
  tour: TourDetail;
};

export function AboutThisTour({ tour }: AboutThisTourProps) {
  const t = useTranslation();
  const { labelContent } = useBookingContent();

  return (
    <section className="mt-13 space-y-4">
      <div>
        <h2 className="text-base font-semibold font-inter text-foreground">
          {t("booking.tour.about")}
        </h2>
        <p className="mt-2 text-sm font-medium font-satoshi leading-relaxed text-foreground/75">
          {labelContent(tour.description)}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {tour.features.map((feature) => (
          <span
            key={feature}
            className="inline-flex items-center gap-2 rounded-lg border border-[#E5E5E5] bg-[#F8F8F8] px-3 py-2 text-sm font-medium font-inter text-[#2F2F2F]"
          >
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {labelContent(feature)}
          </span>
        ))}
      </div>
    </section>
  );
}
