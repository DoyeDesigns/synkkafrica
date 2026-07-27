"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import { useTranslation } from "@/hooks/use-translation";

type ReviewPhotoGalleryProps = {
  photos: string[];
  size?: "sm" | "md";
  label?: string;
  className?: string;
  onRemove?: (index: number) => void;
  removeLabel?: string;
};

const THUMB_SIZE = {
  sm: "h-16 w-16",
  md: "h-20 w-20",
} as const;

function isDataUrl(src: string) {
  return src.startsWith("data:");
}

export function ReviewPhotoGallery({
  photos,
  size = "sm",
  label,
  className = "",
  onRemove,
  removeLabel,
}: ReviewPhotoGalleryProps) {
  const t = useTranslation();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = useCallback(() => setActiveIndex(null), []);

  const showPrevious = useCallback(() => {
    setActiveIndex((current) =>
      current !== null && current > 0 ? current - 1 : current,
    );
  }, []);

  const showNext = useCallback(() => {
    setActiveIndex((current) =>
      current !== null && current < photos.length - 1 ? current + 1 : current,
    );
  }, [photos.length]);

  useEffect(() => {
    if (activeIndex === null) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
      if (event.key === "ArrowLeft") {
        showPrevious();
      }
      if (event.key === "ArrowRight") {
        showNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, close, showNext, showPrevious]);

  if (photos.length === 0) {
    return null;
  }

  const activePhoto = activeIndex !== null ? photos[activeIndex] : null;

  return (
    <>
      <div className={className}>
        {label ? (
          <p className="mb-2 text-xs font-semibold font-satoshi text-[#676565]">{label}</p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {photos.map((photo, index) => (
            <div
              key={`${photo.slice(0, 32)}-${index}`}
              className={`relative overflow-hidden rounded-lg border border-[#E5E5E5] bg-white ${THUMB_SIZE[size]}`}
            >
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                className="relative block h-full w-full transition-opacity hover:opacity-90"
                aria-label={t("common.viewPhoto", { index: index + 1 })}
              >
                <Image
                  src={photo}
                  alt=""
                  fill
                  className="object-cover"
                  sizes={size === "md" ? "80px" : "64px"}
                  unoptimized={isDataUrl(photo)}
                />
              </button>

              {onRemove ? (
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="absolute right-1 top-1 z-10 rounded-full bg-black/60 p-0.5 text-white"
                  aria-label={removeLabel ?? t("account.reviews.removePhoto")}
                >
                  <X className="h-3 w-3" />
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {activePhoto ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
          onClick={close}
          role="presentation"
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-4xl flex-col items-center"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={t("common.photoViewer")}
          >
            <button
              type="button"
              onClick={close}
              className="absolute -top-2 right-0 z-10 rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black/80 sm:-right-2 sm:-top-10"
              aria-label={t("common.closePhotoViewer")}
            >
              <X className="h-5 w-5" />
            </button>

            {photos.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={showPrevious}
                  disabled={activeIndex === 0}
                  className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-40 sm:-left-12"
                  aria-label={t("common.previousPhoto")}
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={showNext}
                  disabled={activeIndex === photos.length - 1}
                  className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-40 sm:-right-12"
                  aria-label={t("common.nextPhoto")}
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            ) : null}

            <div className="relative max-h-[80vh] w-full overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activePhoto}
                alt=""
                className="mx-auto max-h-[80vh] w-auto max-w-full object-contain"
              />
            </div>

            {photos.length > 1 ? (
              <p className="mt-3 text-sm font-medium font-satoshi text-white/90">
                {t("common.photoOfTotal", {
                  current: (activeIndex ?? 0) + 1,
                  total: photos.length,
                })}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
