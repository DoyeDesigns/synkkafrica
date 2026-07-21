"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, Trash2 } from "lucide-react";

import { formatReviewLabels, type UserAccountReview } from "@/features/account/data/account-reviews";
import { useTranslation } from "@/hooks/use-translation";

type ReviewCardProps = {
  review: UserAccountReview;
  onDelete?: (reviewId: string) => void;
};

export function ReviewCard({ review, onDelete }: ReviewCardProps) {
  const t = useTranslation();
  const fullStars = Math.floor(review.rating);
  const hasHalfStar = review.rating % 1 >= 0.5;
  const labels = formatReviewLabels(review.submittedAt);

  return (
    <article className="flex h-full flex-col rounded-2xl border border-[#EEEEEE] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, index) => {
              const isFilled = index < fullStars;
              const isHalf = index === fullStars && hasHalfStar;

              return (
                <Star
                  key={index}
                  className={`h-3.5 w-3.5 ${
                    isFilled || isHalf
                      ? "fill-amber-400 text-amber-400"
                      : "fill-zinc-200 text-zinc-200"
                  }`}
                />
              );
            })}
          </div>

          <span className="text-sm font-medium font-satoshi text-[#D85A30]">
            {review.rating}{" "}
            <span className="text-foreground">| {t("account.reviews.youRated")}</span>
          </span>
        </div>

        <button
          type="button"
          aria-label={t("account.reviews.deleteReview")}
          onClick={() => onDelete?.(review.id)}
          className="text-[#9E9E9E] transition-colors hover:text-foreground"
        >
          <Trash2 className="h-4 w-4 text-foreground" strokeWidth={1.75} />
        </button>
      </div>

      <blockquote className="mt-4 flex-1 text-sm font-medium font-satoshi leading-relaxed text-foreground">
        &ldquo;{review.text}&rdquo;
      </blockquote>

      {review.photos.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {review.photos.map((photo, index) => (
            <div
              key={`${review.id}-photo-${index}`}
              className="relative h-16 w-16 overflow-hidden rounded-lg border border-[#E5E5E5]"
            >
              <Image src={photo} alt="" fill className="object-cover" sizes="64px" />
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#F0F0F0] pt-4">
        <div className="flex min-w-0 flex-col gap-1">
          <Link
            href={`/account/bookings/${review.bookingId}`}
            className="truncate text-sm font-medium font-satoshi text-foreground underline underline-offset-2"
          >
            {review.productName}
          </Link>
          <p className="text-xs font-medium font-satoshi text-foreground/60">
            {t("account.reviews.bookingReference", { reference: review.bookingReference })}
          </p>
        </div>

        <p className="shrink-0 text-xs font-medium font-satoshi text-[#3C3C3C]">
          {labels.time}
          <span className="mx-1.5 text-foreground/35">|</span>
          {labels.date}
        </p>
      </div>
    </article>
  );
}
