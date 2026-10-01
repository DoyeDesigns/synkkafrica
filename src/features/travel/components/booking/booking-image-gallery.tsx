"use client";

import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type TouchEvent,
} from "react";
import { createPortal } from "react-dom";

type BookingImageGalleryProps = {
  // Ordered with the listing's main (cover) image first.
  images: string[];
  alt: string;
  // Kept for callers that pass it; the carousel shows every photo, so the
  // count isn't needed any more.
  extraPhotoCount?: number;
  overlay?: ReactNode;
};

// Horizontal swipe distance (px) that counts as "next/previous".
const SWIPE_THRESHOLD = 40;

function useSwipe(onPrev: () => void, onNext: () => void) {
  const start = useRef<{ x: number; y: number } | null>(null);
  return {
    onTouchStart: (event: TouchEvent) => {
      const touch = event.touches[0];
      start.current = { x: touch.clientX, y: touch.clientY };
    },
    onTouchEnd: (event: TouchEvent) => {
      if (!start.current) return;
      const touch = event.changedTouches[0];
      const dx = touch.clientX - start.current.x;
      const dy = touch.clientY - start.current.y;
      start.current = null;
      // Ignore mostly-vertical gestures so the page can still scroll.
      if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
      if (dx < 0) onNext();
      else onPrev();
    },
  };
}

function ArrowButton({
  direction,
  onClick,
  large = false,
}: {
  direction: "prev" | "next";
  onClick: () => void;
  large?: boolean;
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      aria-label={direction === "prev" ? "Previous photo" : "Next photo"}
      className={`absolute top-1/2 z-10 flex -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#2F2F2F] shadow-md transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#135391] ${
        direction === "prev" ? "left-3" : "right-3"
      } ${large ? "h-12 w-12" : "h-10 w-10"}`}
    >
      <Icon className={large ? "h-6 w-6" : "h-5 w-5"} strokeWidth={2} />
    </button>
  );
}

export function BookingImageGallery({
  images,
  alt,
  overlay,
}: BookingImageGalleryProps) {
  const photos = images.filter(Boolean);
  const count = photos.length;
  const [index, setIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const current = index < count ? index : 0;

  const go = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );
  const prev = useCallback(() => go(current - 1), [go, current]);
  const next = useCallback(() => go(current + 1), [go, current]);
  const swipe = useSwipe(prev, next);

  // Keep the selected thumbnail in view as the slide changes.
  useEffect(() => {
    const thumb = thumbsRef.current?.querySelector<HTMLElement>(
      `[data-thumb="${current}"]`,
    );
    thumb?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  }, [current]);

  if (count === 0) return null;
  const multiple = count > 1;

  return (
    <div className="space-y-2">
      <div
        className="group relative h-[240px] overflow-hidden rounded-2xl bg-zinc-100 sm:h-[320px] lg:h-[420px]"
        role="region"
        aria-roledescription="carousel"
        aria-label={`${alt} photos`}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") prev();
          if (event.key === "ArrowRight") next();
        }}
        {...swipe}
      >
        {/* Slides sit side by side and the track slides between them. */}
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {photos.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setViewerOpen(true)}
              className="relative h-full w-full shrink-0 cursor-zoom-in"
              aria-label={`Open photo ${i + 1} of ${count} full screen`}
              aria-hidden={i !== current}
              tabIndex={i === current ? 0 : -1}
            >
              <Image
                src={src}
                alt={i === 0 ? alt : ""}
                fill
                priority={i === 0}
                loading={i === 0 ? undefined : "lazy"}
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 760px"
              />
            </button>
          ))}
        </div>

        {overlay}

        {multiple ? (
          <>
            <ArrowButton direction="prev" onClick={prev} />
            <ArrowButton direction="next" onClick={next} />
            <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold font-satoshi text-white">
              {current + 1} / {count}
            </span>
          </>
        ) : null}
        <button
          type="button"
          onClick={() => setViewerOpen(true)}
          aria-label="View photos full screen"
          className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold font-satoshi text-white hover:bg-black/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <Expand className="h-3.5 w-3.5" strokeWidth={2} />
          {multiple ? `View all ${count}` : "View"}
        </button>
      </div>

      {multiple ? (
        <div
          ref={thumbsRef}
          className="flex gap-2 overflow-x-auto pb-1"
          aria-label="Choose a photo"
        >
          {photos.map((src, i) => {
            const selected = i === current;
            return (
              <button
                key={`${src}-${i}`}
                type="button"
                data-thumb={i}
                onClick={() => go(i)}
                aria-current={selected}
                aria-label={`Show photo ${i + 1} of ${count}`}
                className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 bg-zinc-100 transition-opacity ${
                  selected
                    ? "border-[#135391] opacity-100"
                    : "border-transparent opacity-70 hover:opacity-100"
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

      {viewerOpen ? (
        <FullscreenViewer
          photos={photos}
          alt={alt}
          index={current}
          onPrev={prev}
          onNext={next}
          onClose={() => setViewerOpen(false)}
        />
      ) : null}
    </div>
  );
}

// Full-screen slideshow: arrows, swipe, ←/→ and Escape.
function FullscreenViewer({
  photos,
  alt,
  index,
  onPrev,
  onNext,
  onClose,
}: {
  photos: string[];
  alt: string;
  index: number;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const swipe = useSwipe(onPrev, onNext);
  const multiple = photos.length > 1;

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onPrev();
      if (event.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${alt} photos`}
      className="fixed inset-0 z-[90] flex flex-col bg-black/95"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <span className="text-sm font-semibold font-satoshi">
          {index + 1} / {photos.length}
        </span>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close photos"
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      <div className="relative min-h-0 flex-1" {...swipe}>
        <Image
          key={photos[index]}
          src={photos[index]}
          alt={alt}
          fill
          className="object-contain"
          sizes="100vw"
        />
        {multiple ? (
          <>
            <ArrowButton direction="prev" onClick={onPrev} large />
            <ArrowButton direction="next" onClick={onNext} large />
          </>
        ) : null}
      </div>
      <div className="h-6" />
    </div>,
    document.body,
  );
}
