"use client";

import { MapPin } from "lucide-react";
import Image from "next/image";

import { ReviewSummaryButton } from "@/features/travel/components/booking/review-summary-button";
import { SaveListingButton } from "@/features/account/components/save-listing-button";
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
        <SaveListingButton
          listingId={property.id}
          className="absolute right-4 top-4"
        />
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
  return (
    <div className="space-y-2">
      <ReviewSummaryButton
        productId={property.id}
        rating={property.rating}
        reviewCount={property.reviewCount}
      />

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
