"use client";

import { Heart, MapPin, Star } from "lucide-react";
import Image from "next/image";

import { ReviewCount } from "@/components/review-count";
import { useBookingContent } from "@/hooks/use-booking-content";
import { useTranslation } from "@/hooks/use-translation";
import type { CarDetail } from "@/features/travel/data/car-booking";

type CarGalleryProps = {
  car: CarDetail;
};

export function CarGallery({ car }: CarGalleryProps) {
  const t = useTranslation();
  const [mainImage, thumbnail] = car.images;
  const fullStars = Math.floor(car.rating);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-sm font-satoshi">
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
            rating={car.rating}
            reviewCount={car.reviewCount}
            className="font-medium text-foreground"
          />
        </div>

        <h1 className="text-2xl font-bold font-montserrat text-foreground sm:text-[28px]">
          {car.name}
        </h1>

        <p className="inline-flex items-center gap-1.5 text-sm font-medium font-satoshi text-foreground">
          <MapPin className="h-4 w-4 shrink-0 text-[#2F2F2F]" strokeWidth={1.5} />
          {car.country}
        </p>
      </div>

      <div className="relative aspect-16/10 w-full overflow-hidden rounded-2xl bg-zinc-100">
        <Image
          src={mainImage}
          alt={car.name}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 760px"
        />
        <button
          type="button"
          aria-label={t("booking.car.saveCar")}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm"
        >
          <Heart className="h-5 w-5 text-foreground" strokeWidth={1.5} />
        </button>
      </div>

      {thumbnail ? (
        <div className="relative aspect-[4/3] w-28 overflow-hidden rounded-xl bg-zinc-100">
          <Image
            src={thumbnail}
            alt=""
            fill
            className="object-cover"
            sizes="112px"
          />
        </div>
      ) : null}
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
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {labelContent(feature)}
          </span>
        ))}
      </div>
    </section>
  );
}
