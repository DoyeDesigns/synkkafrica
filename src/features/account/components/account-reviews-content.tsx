"use client";

import { useState } from "react";

import { AccountReviewForm } from "@/features/account/components/account-review-form";
import { ReviewCard } from "@/features/account/components/review-card";
import { useAccountReviews } from "@/features/account/hooks/use-account-reviews";
import { useTranslation } from "@/hooks/use-translation";

type AccountReviewsContentProps = {
  userId: string;
  userEmail: string;
  authorName: string;
};

export function AccountReviewsContent({
  userId,
  userEmail,
  authorName,
}: AccountReviewsContentProps) {
  const t = useTranslation();
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);

  const { ready, reviews, pendingReviewBookings, submitReviewForBooking, removeReview } =
    useAccountReviews(userId, userEmail, authorName);

  if (!ready) {
    return <div className="min-h-[320px] rounded-2xl bg-white" />;
  }

  const activeBooking = pendingReviewBookings.find(
    (booking) => booking.id === activeBookingId,
  );

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-[#EEEEEE] bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-lg font-bold font-montserrat text-foreground">
          {t("account.reviews.title")}{" "}
          <span className="text-[#D85A30]">({reviews.length})</span>
        </h1>

        {pendingReviewBookings.length > 0 ? (
          <div className="mt-6 space-y-4">
            <div>
              <h2 className="text-base font-semibold font-inter text-foreground">
                {t("account.reviews.pendingTitle")}
              </h2>
              <p className="mt-1 text-sm font-satoshi text-foreground/70">
                {t("account.reviews.pendingHint")}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {pendingReviewBookings.map((booking) => {
                const isActive = activeBookingId === booking.id;

                return (
                  <button
                    key={booking.id}
                    type="button"
                    onClick={() => setActiveBookingId(booking.id)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium font-satoshi transition-colors ${
                      isActive
                        ? "border-[#004785] bg-[#E8F3FF] text-[#004785]"
                        : "border-[#E5E5E5] bg-white text-foreground hover:border-[#D85A30]"
                    }`}
                  >
                    {booking.title}
                  </button>
                );
              })}
            </div>

            {activeBooking ? (
              <AccountReviewForm
                title={t("account.reviews.writeReview")}
                subtitle={`${activeBooking.title} · ${activeBooking.orderNumber}`}
                onSubmit={(input) => {
                  submitReviewForBooking(activeBooking.id, input);
                  setActiveBookingId(null);
                }}
              />
            ) : (
              <p className="rounded-xl border border-dashed border-[#E5E5E5] bg-[#FAFAFA] px-4 py-6 text-sm font-satoshi text-foreground/70">
                {t("account.reviews.selectBooking")}
              </p>
            )}
          </div>
        ) : (
          <p className="mt-6 rounded-xl border border-[#E8E8E8] bg-[#FAFAFA] px-4 py-6 text-sm font-satoshi text-foreground/70">
            {t("account.reviews.noPending")}
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-[#EEEEEE] bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-base font-semibold font-inter text-foreground">
          {t("account.reviews.submittedTitle")}
        </h2>

        {reviews.length > 0 ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onDelete={removeReview}
              />
            ))}
          </div>
        ) : (
          <p className="mt-6 rounded-xl border border-[#E8E8E8] bg-[#FAFAFA] px-4 py-10 text-center text-sm font-satoshi text-foreground/70">
            {t("account.reviews.empty")}
          </p>
        )}
      </div>
    </section>
  );
}
