"use client";

import { Heart, Share2, Star } from "lucide-react";
import Image from "next/image";

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
  const [mainImage, ...thumbnails] = tourPackage.images;

  return (
    <div className="space-y-3">
      <div className="relative aspect-16/10 w-full overflow-hidden rounded-2xl bg-zinc-100">
        <Image
          src={mainImage}
          alt={tourPackage.title}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 760px"
        />
        <button
          type="button"
          aria-label={t("booking.package.savePackage")}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm xl:hidden"
        >
          <Heart className="h-5 w-5 text-foreground" strokeWidth={1.5} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {thumbnails.slice(0, 3).map((image, index) => {
          const isLast = index === 2 && tourPackage.extraPhotoCount > 0;

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
                    count: tourPackage.extraPhotoCount,
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
