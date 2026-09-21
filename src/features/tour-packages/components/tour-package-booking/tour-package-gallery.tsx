"use client";

import { Heart, Share2, Star } from "lucide-react";

import { BookingImageGallery } from "@/features/travel/components/booking/booking-image-gallery";
import { useTranslation } from "@/hooks/use-translation";
import type { TourPackageDetail } from "@/features/tour-packages/data/tour-package-booking";

type TourPackageHeaderProps = {
  tourPackage: TourPackageDetail;
};

export function TourPackageHeader({ tourPackage }: TourPackageHeaderProps) {
  const t = useTranslation();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF1EA] px-3 py-1 text-xs font-bold font-satoshi uppercase tracking-wide text-[#D85A30]">
          <Star className="h-3.5 w-3.5 fill-[#D85A30] text-[#D85A30]" />
          {tourPackage.badgeLabel}
        </span>

        <h1 className="text-2xl font-bold font-montserrat text-foreground sm:text-[28px]">
          {tourPackage.title}
        </h1>

        <p className="text-sm font-medium font-satoshi text-foreground/75">
          {tourPackage.location} · {tourPackage.scheduleLabel}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          aria-label={t("booking.package.sharePackage")}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E5E5] bg-white text-foreground transition-colors hover:bg-[#FAFAFA]"
        >
          <Share2 className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          aria-label={t("booking.package.savePackage")}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E5E5] bg-white text-foreground transition-colors hover:bg-[#FAFAFA]"
        >
          <Heart className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}

type TourPackageGalleryProps = {
  tourPackage: TourPackageDetail;
};

export function TourPackageGallery({ tourPackage }: TourPackageGalleryProps) {
  const t = useTranslation();

  return (
    <BookingImageGallery
      images={tourPackage.images}
      alt={tourPackage.title}
      extraPhotoCount={tourPackage.extraPhotoCount}
      overlay={
        <button
          type="button"
          aria-label={t("booking.package.savePackage")}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm xl:hidden"
        >
          <Heart className="h-5 w-5 text-foreground" strokeWidth={1.5} />
        </button>
      }
    />
  );
}
