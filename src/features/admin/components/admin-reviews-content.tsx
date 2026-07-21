"use client";

import { useState } from "react";

import {
  ADMIN_REVIEWS,
  type AdminReview,
  type AdminReviewStatus,
} from "@/features/admin/data/admin-reviews";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

const STATUS_LABEL_KEYS: Record<AdminReviewStatus, TranslationKey> = {
  published: "admin.reviews.status.published",
  flagged: "admin.reviews.status.flagged",
  hidden: "admin.reviews.status.hidden",
};

export function AdminReviewsContent() {
  const t = useTranslation();
  const [reviews, setReviews] = useState(ADMIN_REVIEWS);
  const [responseDrafts, setResponseDrafts] = useState<Record<string, string>>(
    {},
  );

  const setStatus = (id: string, status: AdminReviewStatus) => {
    setReviews((current) =>
      current.map((r) => (r.id === id ? { ...r, status } : r)),
    );
  };

  return (
    <>
      <h2 className="text-lg font-bold font-satoshi text-[#2F2F2F]">
        {t("admin.reviews.title")}
      </h2>

      <div className="space-y-4">
        {reviews.map((review) => (
          <article
            key={review.id}
            className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold font-satoshi text-[#2F2F2F]">
                {review.experienceTitle}
              </span>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  review.status === "flagged"
                    ? "bg-[#FFF3E0] text-[#E65100]"
                    : review.status === "hidden"
                      ? "bg-[#F5F5F5] text-[#676565]"
                      : "bg-[#E8F5E9] text-[#2E7D32]"
                }`}
              >
                {t(STATUS_LABEL_KEYS[review.status])}
              </span>
            </div>
            <p className="mt-2 text-sm font-medium font-satoshi text-[#676565]">
              {review.guestName} · {review.rating}/5 · {review.vendorName}
            </p>
            <p className="mt-2 text-sm font-satoshi text-[#2F2F2F]">
              {review.comment}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setStatus(review.id, "flagged")}
                className="rounded-lg border border-[#E65100] px-3 py-1.5 text-xs font-bold font-satoshi text-[#E65100]"
              >
                {t("admin.reviews.flag")}
              </button>
              <button
                type="button"
                onClick={() => setStatus(review.id, "hidden")}
                className="rounded-lg border border-[#676565] px-3 py-1.5 text-xs font-bold font-satoshi text-[#676565]"
              >
                {t("admin.reviews.hide")}
              </button>
              <button
                type="button"
                onClick={() => setStatus(review.id, "published")}
                className="rounded-lg border border-[#2E7D32] px-3 py-1.5 text-xs font-bold font-satoshi text-[#2E7D32]"
              >
                {t("admin.reviews.publish")}
              </button>
            </div>

            <label className="mt-4 flex flex-col gap-2">
              <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
                {t("admin.reviews.respondAsSynkkafrica")}
              </span>
              <textarea
                value={responseDrafts[review.id] ?? ""}
                onChange={(e) =>
                  setResponseDrafts((d) => ({
                    ...d,
                    [review.id]: e.target.value,
                  }))
                }
                placeholder={t("admin.reviews.responsePlaceholder")}
                className="min-h-[80px] w-full rounded-lg border border-[#E5E5E5] px-3 py-2 text-sm font-medium font-satoshi outline-none focus:border-[#004785]"
              />
            </label>
          </article>
        ))}
      </div>
    </>
  );
}
