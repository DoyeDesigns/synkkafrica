"use client";

import { ReviewCard } from "@/features/account/components/review-card";
import { ACCOUNT_REVIEWS } from "@/features/account/data/account-reviews";
import { useTranslation } from "@/hooks/use-translation";

export function AccountReviewsContent() {
  const t = useTranslation();

  return (
    <section className="rounded-2xl border border-[#EEEEEE] bg-white p-6 shadow-sm sm:p-8">
      <h1 className="text-lg font-bold font-montserrat text-foreground">
        {t("account.reviews.title")}{" "}
        <span className="text-[#D85A30]">({ACCOUNT_REVIEWS.length})</span>
      </h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {ACCOUNT_REVIEWS.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </section>
  );
}
