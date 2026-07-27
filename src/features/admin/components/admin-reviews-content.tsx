"use client";

import { useMemo, useState } from "react";

import {
  ADMIN_REVIEW_CATEGORY_FILTERS,
  ADMIN_REVIEWS,
  filterAdminReviewsByCategory,
  type AdminReviewCategoryFilter,
  type AdminReviewStatus,
} from "@/features/admin/data/admin-reviews";
import { ReviewPhotoGallery } from "@/components/review-photo-gallery";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

const CATEGORY_LABEL_KEYS: Record<AdminReviewCategoryFilter, TranslationKey> = {
  unanswered: "admin.reviews.category.unanswered",
  responseRequired: "admin.reviews.category.responseRequired",
  flagged: "admin.reviews.category.flagged",
  deleted: "admin.reviews.category.deleted",
  published: "admin.reviews.category.published",
};

const STATUS_LABEL_KEYS: Record<AdminReviewStatus, TranslationKey> = {
  published: "admin.reviews.status.published",
  flagged: "admin.reviews.status.flagged",
  deleted: "admin.reviews.status.deleted",
};

type BulkAction = "publish" | "flag" | "delete" | "responseRequired";

export function AdminReviewsContent() {
  const t = useTranslation();
  const [reviews, setReviews] = useState(ADMIN_REVIEWS);
  const [categoryFilter, setCategoryFilter] =
    useState<AdminReviewCategoryFilter>("unanswered");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [responseDrafts, setResponseDrafts] = useState<Record<string, string>>(
    {},
  );

  const filteredReviews = useMemo(
    () => filterAdminReviewsByCategory(reviews, categoryFilter),
    [categoryFilter, reviews],
  );

  const allVisibleSelected =
    filteredReviews.length > 0 &&
    filteredReviews.every((review) => selectedIds.includes(review.id));

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds((current) =>
        current.filter((id) => !filteredReviews.some((review) => review.id === id)),
      );
      return;
    }

    setSelectedIds((current) => [
      ...new Set([...current, ...filteredReviews.map((review) => review.id)]),
    ]);
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id],
    );
  };

  const setStatus = (id: string, status: AdminReviewStatus) => {
    setReviews((current) =>
      current.map((review) =>
        review.id === id ? { ...review, status } : review,
      ),
    );
  };

  const setResponseRequired = (id: string, responseRequired: boolean) => {
    setReviews((current) =>
      current.map((review) =>
        review.id === id ? { ...review, responseRequired } : review,
      ),
    );
  };

  const applyBulkAction = (action: BulkAction) => {
    if (selectedIds.length === 0) {
      return;
    }

    if (action === "responseRequired") {
      setReviews((current) =>
        current.map((review) =>
          selectedIds.includes(review.id)
            ? { ...review, responseRequired: true }
            : review,
        ),
      );
      setSelectedIds([]);
      return;
    }

    const statusMap: Record<Exclude<BulkAction, "responseRequired">, AdminReviewStatus> = {
      publish: "published",
      flag: "flagged",
      delete: "deleted",
    };

    setReviews((current) =>
      current.map((review) =>
        selectedIds.includes(review.id)
          ? { ...review, status: statusMap[action] }
          : review,
      ),
    );
    setSelectedIds([]);
  };

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold font-satoshi text-[#2F2F2F]">
          {t("admin.reviews.title")}
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={toggleSelectAll}
            className="rounded-lg border border-[#E5E5E5] bg-white px-3 py-2 text-xs font-bold font-satoshi text-[#676565] transition-colors hover:bg-[#FAFAFA]"
          >
            {allVisibleSelected
              ? t("admin.reviews.deselectAll")
              : t("admin.reviews.selectAll")}
          </button>
          <button
            type="button"
            onClick={() => applyBulkAction("publish")}
            disabled={selectedIds.length === 0}
            className="rounded-lg border border-[#2E7D32] bg-white px-3 py-2 text-xs font-bold font-satoshi text-[#2E7D32] transition-colors hover:bg-[#E8F5E9] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("admin.reviews.bulkPublish")}
          </button>
          <button
            type="button"
            onClick={() => applyBulkAction("flag")}
            disabled={selectedIds.length === 0}
            className="rounded-lg border border-[#E65100] bg-white px-3 py-2 text-xs font-bold font-satoshi text-[#E65100] transition-colors hover:bg-[#FFF3E0] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("admin.reviews.bulkFlag")}
          </button>
          <button
            type="button"
            onClick={() => applyBulkAction("responseRequired")}
            disabled={selectedIds.length === 0}
            className="rounded-lg border border-[#135391] bg-white px-3 py-2 text-xs font-bold font-satoshi text-[#135391] transition-colors hover:bg-[#F0F6FC] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("admin.reviews.bulkResponseRequired")}
          </button>
          <button
            type="button"
            onClick={() => applyBulkAction("delete")}
            disabled={selectedIds.length === 0}
            className="rounded-lg border border-[#C0392B] bg-white px-3 py-2 text-xs font-bold font-satoshi text-[#C0392B] transition-colors hover:bg-[#FDEBEB] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("admin.reviews.bulkDelete")}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {ADMIN_REVIEW_CATEGORY_FILTERS.map((category) => {
          const isActive = categoryFilter === category;
          const count = filterAdminReviewsByCategory(reviews, category).length;

          return (
            <button
              key={category}
              type="button"
              onClick={() => {
                setCategoryFilter(category);
                setSelectedIds([]);
              }}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold font-satoshi transition-colors ${
                isActive
                  ? "border-[#135391] bg-[#F0F6FC] text-[#135391]"
                  : "border-[#E5E5E5] bg-white text-[#676565] hover:bg-[#FAFAFA]"
              }`}
            >
              {t(CATEGORY_LABEL_KEYS[category])}{" "}
              <span className={isActive ? "text-[#135391]" : "text-[#676565]"}>
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <article
              key={review.id}
              className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(review.id)}
                  onChange={() => toggleSelected(review.id)}
                  aria-label={t("admin.reviews.selectReview", {
                    title: review.experienceTitle,
                  })}
                  className="mt-1 size-4 shrink-0 accent-[#135391]"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold font-satoshi text-[#2F2F2F]">
                      {review.experienceTitle}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        review.status === "flagged"
                          ? "bg-[#FFF3E0] text-[#E65100]"
                          : review.status === "deleted"
                            ? "bg-[#F5F5F5] text-[#676565]"
                            : "bg-[#E8F5E9] text-[#2E7D32]"
                      }`}
                    >
                      {t(STATUS_LABEL_KEYS[review.status])}
                    </span>
                    {!review.adminResponse?.trim() ? (
                      <span className="rounded-full bg-[#FDEBEB] px-2.5 py-1 text-xs font-semibold text-[#C0392B]">
                        {t("admin.reviews.unansweredBadge")}
                      </span>
                    ) : null}
                    {review.responseRequired ? (
                      <span className="rounded-full bg-[#E8EAF6] px-2.5 py-1 text-xs font-semibold text-[#3949AB]">
                        {t("admin.reviews.responseRequiredBadge")}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm font-medium font-satoshi text-[#676565]">
                    {review.guestName} · {review.rating}/5 · {review.vendorName}
                  </p>
                  <p className="mt-2 text-sm font-satoshi text-[#2F2F2F]">
                    {review.comment}
                  </p>

                  {review.photos.length > 0 ? (
                    <ReviewPhotoGallery
                      photos={review.photos}
                      size="md"
                      label={t("admin.reviews.photosLabel")}
                      className="mt-3"
                    />
                  ) : null}

                  {review.adminResponse ? (
                    <div className="mt-3 rounded-lg bg-[#F0F6FC] px-4 py-3">
                      <p className="text-xs font-semibold font-satoshi text-[#135391]">
                        {t("admin.reviews.officialResponse")}
                      </p>
                      <p className="mt-1 text-sm font-medium font-satoshi text-[#2F2F2F]">
                        {review.adminResponse}
                      </p>
                    </div>
                  ) : null}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setResponseRequired(review.id, !review.responseRequired)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-bold font-satoshi ${
                        review.responseRequired
                          ? "border-[#3949AB] bg-[#E8EAF6] text-[#3949AB]"
                          : "border-[#135391] text-[#135391]"
                      }`}
                    >
                      {review.responseRequired
                        ? t("admin.reviews.clearResponseRequired")
                        : t("admin.reviews.responseRequired")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus(review.id, "flagged")}
                      className="rounded-lg border border-[#E65100] px-3 py-1.5 text-xs font-bold font-satoshi text-[#E65100]"
                    >
                      {t("admin.reviews.flag")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus(review.id, "deleted")}
                      className="rounded-lg border border-[#676565] px-3 py-1.5 text-xs font-bold font-satoshi text-[#676565]"
                    >
                      {t("admin.reviews.delete")}
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
                        setResponseDrafts((drafts) => ({
                          ...drafts,
                          [review.id]: e.target.value,
                        }))
                      }
                      placeholder={t("admin.reviews.responsePlaceholder")}
                      className="min-h-[80px] w-full rounded-lg border border-[#E5E5E5] px-3 py-2 text-sm font-medium font-satoshi outline-none focus:border-[#004785]"
                    />
                  </label>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-xl border border-[#EEEEEE] bg-[#FAFAFA] p-10 text-center">
            <p className="text-sm font-medium font-satoshi text-[#676565]">
              {t("admin.reviews.empty")}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
