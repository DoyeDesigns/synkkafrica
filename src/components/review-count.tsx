"use client";

import { useTranslation } from "@/hooks/use-translation";

type ReviewCountProps = {
  rating: number;
  reviewCount: number;
  className?: string;
};

export function ReviewCount({ rating, reviewCount, className }: ReviewCountProps) {
  const t = useTranslation();

  return (
    <span className={className}>
      <span className="text-[#D85A30]">{rating}</span> | {reviewCount} {t("common.reviews")}
    </span>
  );
}
