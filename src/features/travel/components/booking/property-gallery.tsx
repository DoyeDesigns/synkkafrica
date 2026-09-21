"use client";

import { MapPin } from "lucide-react";

import { BookingImageGallery } from "@/features/travel/components/booking/booking-image-gallery";
import { ReviewSummaryButton } from "@/features/travel/components/booking/review-summary-button";
import { SaveListingButton } from "@/features/account/components/save-listing-button";
import { useBookingContent } from "@/hooks/use-booking-content";
import type { PropertyDetail } from "@/features/travel/data/property-booking";

type PropertyGalleryProps = {
  property: PropertyDetail;
};

export function PropertyGallery({ property }: PropertyGalleryProps) {
  return (
    <BookingImageGallery
      images={property.images}
      alt={property.name}
      extraPhotoCount={property.extraPhotoCount}
      overlay={
        <SaveListingButton
          listingId={property.id}
          className="absolute right-4 top-4"
        />
      }
    />
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
