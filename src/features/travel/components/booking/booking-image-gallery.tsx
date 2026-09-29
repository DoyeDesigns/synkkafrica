"use client";

import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { useTranslation } from "@/hooks/use-translation";

type BookingImageGalleryProps = {
  // Ordered with the listing's main (cover) image first.
  images: string[];
  alt: string;
  overlay?: ReactNode;
};

const VIDEO_URL = /\.(mp4|webm|mov|m4v|ogv|ogg|avi|mkv)(\?|#|$)/i;

// Only real, distinct image URLs belong in the gallery. Videos would render as
// a broken next/image, and duplicates would make the mosaic look padded.
function galleryPhotos(images: string[]) {
  const seen = new Set<string>();
  const photos: string[] = [];
  for (const raw of images) {
    const src = raw?.trim();
    if (!src || VIDEO_URL.test(src) || seen.has(src)) continue;
    seen.add(src);
    photos.push(src);
  }
  return photos;
}

// Thumbnail grid shape for 1–4 side tiles, so fewer photos don't get padded
// with repeats of the same image.
const THUMB_GRID: Record<number, string> = {
  1: "grid-cols-1 grid-rows-1",
  2: "grid-cols-1 grid-rows-2",
  3: "grid-cols-2 grid-rows-2",
  4: "grid-cols-2 grid-rows-2",
};

const MAX_THUMBS = 4;

export function BookingImageGallery({
  images,
  alt,
  overlay,
}: BookingImageGalleryProps) {
  const t = useTranslation();
  const photos = useMemo(() => galleryPhotos(images), [images]);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const hero = photos[0];
  const thumbs = photos.slice(1, 1 + MAX_THUMBS);
  // Photos not visible in the mosaic (hero + thumbnails).
  const moreCount = Math.max(0, photos.length - 1 - thumbs.length);

  const open = (index: number) => setViewerIndex(index);

  if (!hero) return null;

  const heroTile = (
    <>
      <Image
        src={hero}
        alt={alt}
        fill
        priority
        className="object-cover"
        sizes={
          thumbs.length === 0
            ? "(max-width: 1024px) 100vw, 760px"
            : "(max-width: 1024px) 50vw, 420px"
        }
      />
      <button
        type="button"
        onClick={() => open(0)}
        aria-label={t("common.viewPhoto", { index: 1 })}
        className="absolute inset-0 cursor-zoom-in"
      />
      {overlay}
      {photos.length > 1 ? (
        <button
          type="button"
          onClick={() => open(0)}
          className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold font-satoshi text-[#2F2F2F] shadow-sm transition-colors hover:bg-white"
        >
          <Images className="h-3.5 w-3.5" strokeWidth={1.75} />
          {t("common.showAllPhotos", { count: photos.length })}
        </button>
      ) : null}
    </>
  );

  return (
    <>
      {thumbs.length === 0 ? (
        <div className="relative h-[240px] overflow-hidden rounded-2xl bg-zinc-100 sm:h-[320px] lg:h-[380px]">
          {heroTile}
        </div>
      ) : (
        <div className="grid h-[240px] grid-cols-2 gap-[3px] overflow-hidden rounded-2xl bg-white sm:h-[320px] sm:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:h-[380px]">
          <div className="relative min-h-0 overflow-hidden bg-zinc-100">
            {heroTile}
          </div>

          <div
            className={`grid min-h-0 gap-[3px] ${THUMB_GRID[thumbs.length] ?? THUMB_GRID[4]}`}
          >
            {thumbs.map((image, index) => {
              const photoIndex = index + 1;
              const isLast = index === thumbs.length - 1 && moreCount > 0;
              const spanFull = thumbs.length === 3 && index === 0;

              return (
                <button
                  key={image}
                  type="button"
                  onClick={() => open(photoIndex)}
                  aria-label={
                    isLast
                      ? t("common.showAllPhotos", { count: photos.length })
                      : t("common.viewPhoto", { index: photoIndex + 1 })
                  }
                  className={`group relative min-h-0 cursor-zoom-in overflow-hidden bg-zinc-100 ${
                    spanFull ? "col-span-2" : ""
                  }`}
                >
                  <Image
                    src={image}
                    alt=""
                    fill
                    className="object-cover transition-opacity group-hover:opacity-90"
                    sizes="220px"
                  />
                  {isLast ? (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-sm font-semibold font-satoshi text-white">
                      <span className="inline-flex items-center gap-1">
                        <Images className="h-4 w-4" strokeWidth={1.75} />+
                        {moreCount}
                      </span>
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {viewerIndex !== null ? (
        <BookingPhotoViewer
          photos={photos}
          alt={alt}
          index={viewerIndex}
          onIndexChange={setViewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      ) : null}
    </>
  );
}

type BookingPhotoViewerProps = {
  photos: string[];
  alt: string;
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
};

function BookingPhotoViewer({
  photos,
  alt,
  index,
  onIndexChange,
  onClose,
}: BookingPhotoViewerProps) {
  const t = useTranslation();
  const total = photos.length;

  const showPrevious = useCallback(
    () => onIndexChange((index - 1 + total) % total),
    [index, onIndexChange, total],
  );
  const showNext = useCallback(
    () => onIndexChange((index + 1) % total),
    [index, onIndexChange, total],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, showNext, showPrevious]);

  // Lock page scroll while the viewer is open.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const current = photos[index];
  if (!current) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex flex-col bg-black/90"
      role="dialog"
      aria-modal="true"
      aria-label={t("common.photoViewer")}
      onClick={onClose}
    >
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <p className="text-sm font-medium font-satoshi text-white/90">
          {t("common.photoOfTotal", { current: index + 1, total })}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-white/10 p-2 transition-colors hover:bg-white/20"
          aria-label={t("common.closePhotoViewer")}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="relative min-h-0 flex-1 px-4 sm:px-16">
        <div
          className="relative h-full w-full"
          onClick={(event) => event.stopPropagation()}
        >
          <Image
            key={current}
            src={current}
            alt={alt}
            fill
            className="object-contain"
            sizes="100vw"
          />
        </div>

        {total > 1 ? (
          <>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showPrevious();
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-2 text-white transition-colors hover:bg-white/25 sm:left-4"
              aria-label={t("common.previousPhoto")}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showNext();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-2 text-white transition-colors hover:bg-white/25 sm:right-4"
              aria-label={t("common.nextPhoto")}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        ) : null}
      </div>

      {total > 1 ? (
        <div
          className="flex gap-2 overflow-x-auto px-4 py-3"
          onClick={(event) => event.stopPropagation()}
        >
          {photos.map((photo, photoIndex) => (
            <button
              key={photo}
              type="button"
              onClick={() => onIndexChange(photoIndex)}
              aria-label={t("common.viewPhoto", { index: photoIndex + 1 })}
              aria-current={photoIndex === index}
              className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-md border-2 transition-opacity ${
                photoIndex === index
                  ? "border-white opacity-100"
                  : "border-transparent opacity-60 hover:opacity-90"
              }`}
            >
              <Image
                src={photo}
                alt=""
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
