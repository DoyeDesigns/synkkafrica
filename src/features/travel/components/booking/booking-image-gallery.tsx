"use client";

import { Images } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

type BookingImageGalleryProps = {
  images: string[];
  alt: string;
  extraPhotoCount?: number;
  overlay?: ReactNode;
};

function mosaicThumbs(images: string[]) {
  const source = images.filter(Boolean);
  if (source.length <= 1) return [];

  const extras = source.slice(1);
  return Array.from({ length: 4 }, (_, index) => {
    return extras[index] ?? source[index % source.length] ?? source[0]!;
  });
}

export function BookingImageGallery({
  images,
  alt,
  extraPhotoCount,
  overlay,
}: BookingImageGalleryProps) {
  const photos = images.filter(Boolean);
  const hero = photos[0];
  const thumbs = mosaicThumbs(photos);
  const moreCount =
    extraPhotoCount ?? Math.max(0, photos.length - 1 - thumbs.length);

  if (!hero) return null;

  if (thumbs.length === 0) {
    return (
      <div className="relative h-[240px] overflow-hidden rounded-2xl bg-zinc-100 sm:h-[320px] lg:h-[380px]">
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
    );
  }

  return (
    <div className="grid h-[240px] grid-cols-2 gap-[3px] overflow-hidden rounded-2xl bg-white sm:h-[320px] sm:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:h-[380px]">
      <div className="relative min-h-0 overflow-hidden bg-zinc-100">
        <Image
          src={hero}
          alt={alt}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 50vw, 420px"
        />
        {overlay}
      </div>

      <div className="grid min-h-0 grid-cols-2 grid-rows-2 gap-[3px]">
        {thumbs.map((image, index) => {
          const isLast = index === thumbs.length - 1 && moreCount > 0;

          return (
            <div
              key={`${image}-${index}`}
              className="relative min-h-0 overflow-hidden bg-zinc-100"
            >
              <Image
                src={image}
                alt=""
                fill
                className="object-cover"
                sizes="220px"
              />
              {isLast ? (
                <div className="absolute inset-x-0 bottom-0 flex justify-end p-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[11px] font-semibold font-satoshi text-white backdrop-blur-[2px]">
                    <Images className="h-3.5 w-3.5" strokeWidth={1.75} />
                    {moreCount}+
                  </span>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
