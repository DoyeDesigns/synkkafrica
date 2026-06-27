"use client";

import { Heart, MapPin, Star } from "lucide-react";
import Image from "next/image";

import { ReviewCount } from "@/components/review-count";
import { useBookingContent } from "@/hooks/use-booking-content";
import { useTranslation } from "@/hooks/use-translation";
import type { PropertyDetail } from "@/features/travel/data/property-booking";

type PropertyGalleryProps = {
  property: PropertyDetail;
};

export function PropertyGallery({ property }: PropertyGalleryProps) {
  const t = useTranslation();
  const [mainImage, ...thumbnails] = property.images;

  return (
    <div className="space-y-3">
      <div className="relative aspect-16/10 overflow-hidden w-full rounded-2xl bg-zinc-100">
        <Image
          src={mainImage}
          alt={property.name}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 760px"
        />
        <button
          type="button"
          aria-label={t("booking.property.saveProperty")}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm"
        >
          <Heart className="h-5 w-5 text-foreground" strokeWidth={1.5} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {thumbnails.slice(0, 3).map((image, index) => {
          const isLast = index === 2 && property.extraPhotoCount > 0;

          return (
            <div
              key={`${image}-${index}`}
              className="relative aspect-[4/3] overflow-hidden rounded-xl bg-zinc-100"
            >
              <Image
                src={image}
                alt=""
                fill
                className="object-cover"
                sizes="240px"
              />
              {isLast ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/45 text-sm font-semibold font-satoshi text-white">
                  {t("booking.property.morePhotos", {
                    count: property.extraPhotoCount,
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

type PropertyHeaderProps = {
  property: PropertyDetail;
};

export function PropertyHeader({ property }: PropertyHeaderProps) {
  const fullStars = Math.floor(property.rating);

  return (
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
          rating={property.rating}
          reviewCount={property.reviewCount}
          className="font-medium text-foreground"
        />
      </div>

      <h1 className="text-2xl font-bold font-montserrat text-foreground sm:text-[28px]">
        {property.name}
      </h1>

      <p className="inline-flex items-center gap-1.5 text-sm font-medium font-satoshi text-foreground">
        <MapPin className="h-4 w-4 shrink-0 text-[#2F2F2F]" strokeWidth={1.5} />
        {property.country}
      </p>
    </div>
  );
}

export function PropertyDescription({ property }: PropertyGalleryProps) {
  const { labelContent } = useBookingContent();

  return (
    <div className="space-y-4 text-base leading-relaxed font-satoshi text-foreground">
      {property.description.map((paragraph) => (
        <p key={paragraph}>
          {labelContent(paragraph, {
            name: property.name,
            location: property.location,
          })}
        </p>
      ))}
    </div>
  );
}
