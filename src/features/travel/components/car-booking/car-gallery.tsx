"use client";

import { Check, Heart, MapPin } from "lucide-react";

import { BookingImageGallery } from "@/features/travel/components/booking/booking-image-gallery";
import { ReviewSummaryButton } from "@/features/travel/components/booking/review-summary-button";
import { useBookingContent } from "@/hooks/use-booking-content";
import { useTranslation } from "@/hooks/use-translation";
import type { CarDetail } from "@/features/travel/data/car-booking";

type CarGalleryProps = {
  car: CarDetail;
};

export function CarGallery({ car }: CarGalleryProps) {
  const t = useTranslation();

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <ReviewSummaryButton
          productId={car.id}
          rating={car.rating}
          reviewCount={car.reviewCount}
        />

        <h1 className="text-2xl font-bold font-montserrat text-foreground sm:text-[28px]">
          {car.name}
        </h1>

        {car.location || car.country || car.pickupAddress ? (
          <p className="inline-flex items-center gap-1.5 text-sm font-medium font-satoshi text-foreground">
            <MapPin className="h-4 w-4 shrink-0 text-[#2F2F2F]" strokeWidth={1.5} />
            {car.location || car.country || car.pickupAddress}
          </p>
        ) : null}
      </div>

      <BookingImageGallery
        images={car.images}
        alt={car.name}
        extraPhotoCount={Math.max(0, car.images.length - 5)}
        overlay={
          <button
            type="button"
            aria-label={t("booking.car.saveCar")}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm"
          >
            <Heart className="h-5 w-5 text-foreground" strokeWidth={1.5} />
          </button>
        }
      />
    </div>
  );
}

type AboutThisCarProps = {
  car: CarDetail;
};

export function AboutThisCar({ car }: AboutThisCarProps) {
  const t = useTranslation();
  const { labelContent } = useBookingContent();

  return (
    <section className="mt-13">
      <h2 className="text-base font-semibold font-inter text-foreground">
        {t("booking.car.about")}
      </h2>

      <div className="mt-4 flex flex-wrap gap-3">
        {car.features.map((feature) => (
          <span
            key={feature}
            className="inline-flex items-center gap-2 rounded-lg border border-[#E5E5E5] bg-[#F8F8F8] px-3 py-2 text-sm font-medium font-inter text-[#2F2F2F]"
          >
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#D85A30]">
              <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
            </span>
            {labelContent(feature)}
          </span>
        ))}
      </div>
    </section>
  );
}
