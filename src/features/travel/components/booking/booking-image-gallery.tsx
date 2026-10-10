"use client";

import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";
import Image from "next/image";
import { useState, type ReactNode } from "react";

type BookingImageGalleryProps = {
  // Ordered with the listing's main (cover) image first.
  images: string[];
  alt: string;
  extraPhotoCount?: number;
  overlay?: ReactNode;
};

export function BookingImageGallery({
  images,
  alt,
  extraPhotoCount,
  overlay,
}: BookingImageGalleryProps) {
  const photos = images.filter(Boolean);
  const [mainIndex, setMainIndex] = useState(0);
  const active = photos[mainIndex] ? mainIndex : 0;
  const hero = photos[active];
  const others = photos
    .map((src, index) => ({ src, index }))
    .filter((photo) => photo.index !== active);
  const mosaic = others.slice(0, 4);
  const hiddenCount = Math.max(
    extraPhotoCount ?? 0,
    others.length - mosaic.length,
  );

  if (!hero) return null;

  return (
    <div className="w-full min-w-0 max-w-full space-y-2">
      {mosaic.length < 4 ? (
        <div className="relative h-[220px] w-full min-w-0 overflow-hidden rounded-2xl bg-zinc-100 sm:h-[320px] lg:h-[380px]">
          <Image
            src={hero}
            alt={alt}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 760px"
          />
          {overlay}
        </div>
      ) : (
        <div className="grid h-[220px] w-full min-w-0 max-w-full grid-cols-1 gap-[3px] overflow-hidden rounded-2xl bg-white sm:h-[320px] sm:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:h-[380px]">
          <div className="relative min-h-0 min-w-0 overflow-hidden bg-zinc-100">
            <Image
              src={hero}
              alt={alt}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 420px"
            />
            {overlay}
          </div>

          <div className="hidden min-h-0 min-w-0 grid-cols-2 grid-rows-2 gap-[3px] sm:grid">
            {mosaic.map((photo, index) => {
              const isLast = index === mosaic.length - 1 && hiddenCount > 0;

              return (
                <button
                  key={`${photo.src}-${photo.index}`}
                  type="button"
                  onClick={() => setMainIndex(photo.index)}
                  className="relative min-h-0 min-w-0 overflow-hidden bg-zinc-100"
                  aria-label={`Show photo ${photo.index + 1} as the main image`}
                >
                  <Image
                    src={photo.src}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="220px"
                  />
                  {isLast ? (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-end p-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[11px] font-semibold font-satoshi text-white backdrop-blur-[2px]">
                        <Images className="h-3.5 w-3.5" strokeWidth={1.75} />
                        {hiddenCount}+
                      </span>
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {photos.length > 1 ? (
        <div className="flex w-full min-w-0 max-w-full gap-2 overflow-x-auto pb-1">
          {photos.map((src, index) => {
            const selected = index === active;

            return (
              <button
                key={`${src}-${index}`}
                type="button"
                onClick={() => setMainIndex(index)}
                aria-pressed={selected}
                aria-label={`Show photo ${index + 1} as the main image`}
                className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 bg-zinc-100 ${
                  selected ? "border-[#135391]" : "border-transparent"
                }`}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
