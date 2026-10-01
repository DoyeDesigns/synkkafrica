"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Search, Star } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCallback, useMemo, useState } from "react";

import { AdminConfirmModal } from "@/features/admin/components/admin-confirm-modal";
import {
  ADMIN_LIST_PAGE_SIZE,
  clampPage,
  ErrorBanner,
  errorMessage,
  formatDate,
  NoticeBanner,
  Pagination,
  SkeletonBlock,
  useUrlSearch,
  useUrlState,
  type Notice,
} from "@/features/admin/components/admin-marketplace-list-kit";
import { useTranslation } from "@/hooks/use-translation";
import { adminHideReview, adminPublishReview } from "@/lib/api/admin";
import {
  listMarketplaceReviews,
  type MarketplaceReview,
  type MarketplaceReviewStatus,
} from "@/lib/api/admin/marketplace-reviews";
import { LIVE_QUERY_OPTIONS } from "@/lib/live-query-options";

const QUERY_KEY = ["admin-marketplace-reviews"] as const;

const STATUS_FILTERS = ["all", "published", "hidden"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const RATING_FILTERS = ["all", "5", "4", "3", "2", "1"] as const;
type RatingFilter = (typeof RATING_FILTERS)[number];

const SORTS = {
  newest: "Newest first",
  oldest: "Oldest first",
  rating_asc: "Lowest rating",
  rating_desc: "Highest rating",
} as const;
type SortKey = keyof typeof SORTS;

const CATEGORY_LABELS: Record<string, string> = {
  car: "Car",
  cars: "Car",
  accommodation: "Stay",
  accommodations: "Stay",
  experience: "Experience",
  experiences: "Experience",
};

type Action = "publish" | "hide";
type PendingConfirm =
  | { kind: "single"; action: Action; review: MarketplaceReview }
  | { kind: "bulk"; action: Action; ids: string[] };

function pick<T extends string>(value: string, allowed: readonly T[], fallback: T): T {
  return (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

function matchesQuery(r: MarketplaceReview, q: string): boolean {
  if (!q) return true;
  return [
    r.listingTitle,
    r.vendorName,
    r.customerName,
    r.customerEmail,
    r.comment,
    r.bookingReference,
  ].some((field) => field?.toLowerCase().includes(q));
}

function sortReviews(rows: MarketplaceReview[], sort: SortKey): MarketplaceReview[] {
  const created = (r: MarketplaceReview) => new Date(r.createdAt).getTime();
  const sorted = [...rows];
  switch (sort) {
    case "oldest":
      return sorted.sort((a, b) => created(a) - created(b));
    case "rating_asc":
      return sorted.sort((a, b) => a.rating - b.rating || created(b) - created(a));
    case "rating_desc":
      return sorted.sort((a, b) => b.rating - a.rating || created(b) - created(a));
    default:
      return sorted.sort((a, b) => created(b) - created(a));
  }
}

export function AdminReviewsLiveContent() {
  const t = useTranslation();
  const { data: session } = useSession();
  const token = session?.accessToken;
  const queryClient = useQueryClient();
  const url = useUrlState();
  const setUrl = url.set;
  const [searchInput, setSearchInput, query] = useUrlSearch(url);

  const statusFilter = pick<StatusFilter>(url.get("status"), STATUS_FILTERS, "all");
  const ratingFilter = pick<RatingFilter>(url.get("rating"), RATING_FILTERS, "all");
  const sort = pick<SortKey>(url.get("sort"), Object.keys(SORTS) as SortKey[], "newest");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const [confirm, setConfirm] = useState<PendingConfirm | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const clearNotice = useCallback(() => setNotice(null), []);

  const {
    data,
    isLoading,
    error: loadError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => listMarketplaceReviews(token as string),
    enabled: Boolean(token),
    ...LIVE_QUERY_OPTIONS,
  });
  const reviews = useMemo(() => data ?? [], [data]);

  const baseFiltered = useMemo(
    () =>
      reviews.filter(
        (r) =>
          (ratingFilter === "all" || r.rating === Number(ratingFilter)) &&
          matchesQuery(r, query),
      ),
    [query, ratingFilter, reviews],
  );

  const statusCounts = useMemo(
    () => ({
      all: baseFiltered.length,
      published: baseFiltered.filter((r) => r.status === "published").length,
      hidden: baseFiltered.filter((r) => r.status === "hidden").length,
    }),
    [baseFiltered],
  );

  const filtered = useMemo(
    () =>
      sortReviews(
        baseFiltered.filter((r) => statusFilter === "all" || r.status === statusFilter),
        sort,
      ),
    [baseFiltered, sort, statusFilter],
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / ADMIN_LIST_PAGE_SIZE));
  const page = clampPage(url.get("page", "1"), pageCount);
  const pageRows = filtered.slice((page - 1) * ADMIN_LIST_PAGE_SIZE, page * ADMIN_LIST_PAGE_SIZE);

  const averageRating = useMemo(() => {
    const published = reviews.filter((r) => r.status === "published");
    if (published.length === 0) return null;
    return published.reduce((sum, r) => sum + r.rating, 0) / published.length;
  }, [reviews]);

  // Only rows on the current page can be selected, so bulk actions never
  // touch something the admin can't see.
  const visibleIds = pageRows.map((r) => r.id);
  const selectedVisible = selectedIds.filter((id) => visibleIds.includes(id));
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

  const toggleSelectAll = () =>
    setSelectedIds(allVisibleSelected ? [] : visibleIds);
  const toggleSelected = (id: string) =>
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    );

  const changeFilter = (updates: Record<string, string | null>) => {
    setSelectedIds([]);
    setUrl({ ...updates, page: null });
  };

  const hasFilters = Boolean(query) || statusFilter !== "all" || ratingFilter !== "all";
  const clearFilters = () => {
    setSearchInput("");
    changeFilter({ q: null, status: null, rating: null });
  };

  // Applies the change optimistically, then calls the API per review. Failed
  // reviews roll back and are reported.
  const runAction = async (action: Action, ids: string[]) => {
    if (!token || ids.length === 0) return;
    const target: MarketplaceReviewStatus = action === "hide" ? "hidden" : "published";
    const previous = queryClient.getQueryData<MarketplaceReview[]>(QUERY_KEY);
    const byId = new Map((previous ?? []).map((r) => [r.id, r]));
    setPendingIds((current) => [...new Set([...current, ...ids])]);
    queryClient.setQueryData<MarketplaceReview[]>(QUERY_KEY, (rows) =>
      rows?.map((r) => (ids.includes(r.id) ? { ...r, status: target } : r)),
    );

    const call = action === "hide" ? adminHideReview : adminPublishReview;
    const results = await Promise.allSettled(ids.map((id) => call(token, id)));
    const failedIds = ids.filter((_, i) => results[i].status === "rejected");
    const firstError = results.find((r) => r.status === "rejected");

    if (failedIds.length > 0) {
      queryClient.setQueryData<MarketplaceReview[]>(QUERY_KEY, (rows) =>
        rows?.map((r) =>
          failedIds.includes(r.id) ? { ...r, status: byId.get(r.id)?.status ?? r.status } : r,
        ),
      );
    }
    setPendingIds((current) => current.filter((id) => !ids.includes(id)));
    setSelectedIds((current) => current.filter((id) => failedIds.includes(id)));

    const verb = action === "hide" ? "hidden" : "published";
    const okCount = ids.length - failedIds.length;
    const single = ids.length === 1 ? byId.get(ids[0]) : undefined;
    const subject = single
      ? `Review by ${single.customerName ?? "a guest"} on "${single.listingTitle ?? "listing"}"`
      : `${okCount} ${okCount === 1 ? "review" : "reviews"}`;

    if (failedIds.length === 0) {
      setNotice({
        tone: "success",
        message: `${subject} ${ids.length === 1 ? "is" : "are"} now ${verb}. Listing ratings were updated.`,
      });
    } else {
      const reason =
        firstError && firstError.status === "rejected"
          ? errorMessage(firstError.reason, "Request failed.")
          : "Request failed.";
      setNotice({
        tone: "error",
        message:
          ids.length === 1
            ? `Couldn't update this review: ${reason}`
            : `${okCount} of ${ids.length} reviews ${verb}; ${failedIds.length} failed: ${reason}`,
      });
    }
    void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
  };

  const confirmCopy = (() => {
    if (!confirm) return null;
    const verb = confirm.action === "hide" ? "Hide" : "Publish";
    if (confirm.kind === "single") {
      const r = confirm.review;
      return {
        title: `${verb} this review?`,
        message:
          `${r.rating}★ review by ${r.customerName ?? "a guest"} on "${r.listingTitle ?? "listing"}". ` +
          (confirm.action === "hide"
            ? "It will be removed from the public listing page and the listing's rating recalculated."
            : "It will be visible on the public listing page and count toward the listing's rating."),
        label: verb,
      };
    }
    const n = confirm.ids.length;
    return {
      title: `${verb} ${n} ${n === 1 ? "review" : "reviews"}?`,
      message:
        confirm.action === "hide"
          ? "The selected reviews will be removed from their public listing pages and those listings' ratings recalculated."
          : "The selected reviews will be visible on their public listing pages and count toward those listings' ratings.",
      label: `${verb} ${n}`,
    };
  })();

  const bulkDisabled = selectedVisible.length === 0 || pendingIds.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold font-satoshi text-[#2F2F2F]">{t("admin.reviews.title")}</h2>
          {!isLoading && reviews.length > 0 ? (
            <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
              {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
              {averageRating !== null ? ` · ${averageRating.toFixed(1)}★ average (published)` : ""}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={toggleSelectAll}
            disabled={visibleIds.length === 0}
            className="rounded-lg border border-[#E5E5E5] bg-white px-3 py-2 text-xs font-bold font-satoshi text-[#676565] transition-colors hover:bg-[#FAFAFA] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#135391] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {allVisibleSelected ? t("admin.reviews.deselectAll") : t("admin.reviews.selectAll")}
            {selectedVisible.length > 0 ? ` (${selectedVisible.length})` : ""}
          </button>
          <button
            type="button"
            onClick={() => setConfirm({ kind: "bulk", action: "publish", ids: selectedVisible })}
            disabled={bulkDisabled}
            className="rounded-lg border border-[#2E7D32] bg-white px-3 py-2 text-xs font-bold font-satoshi text-[#2E7D32] transition-colors hover:bg-[#E8F5E9] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D32] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("admin.reviews.bulkPublish")}
          </button>
          <button
            type="button"
            onClick={() => setConfirm({ kind: "bulk", action: "hide", ids: selectedVisible })}
            disabled={bulkDisabled}
            className="rounded-lg border border-[#C0392B] bg-white px-3 py-2 text-xs font-bold font-satoshi text-[#C0392B] transition-colors hover:bg-[#FDEBEB] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C0392B] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Hide selected
          </button>
        </div>
      </div>

      <section className="rounded-xl border border-[#EEEEEE] bg-[#FAFAFA] p-4">
        <h3 className="text-sm font-bold font-satoshi text-[#2F2F2F]">{t("admin.reviews.actionsGuideTitle")}</h3>
        <ul className="mt-3 space-y-2 text-xs font-medium font-satoshi text-[#676565]">
          <li>{t("admin.reviews.actionsGuide.publish")}</li>
          <li>
            Hide — Remove the review from public view without deleting it. Hidden reviews appear in the Hidden
            tab and can be published again.
          </li>
          <li>Both actions recalculate the listing&apos;s public star rating.</li>
        </ul>
      </section>

      <NoticeBanner notice={notice} onDismiss={clearNotice} />

      {loadError ? (
        <ErrorBanner
          message={errorMessage(loadError, "Couldn't load reviews.")}
          onRetry={() => void refetch()}
          retrying={isRefetching}
        />
      ) : null}

      <div className="space-y-3 rounded-xl border border-[#EEEEEE] bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_repeat(2,minmax(0,0.6fr))]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]" aria-hidden />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by listing, vendor, customer, booking or comment..."
              aria-label="Search reviews"
              className="h-11 w-full rounded-full border border-[#E5E5E5] bg-white pl-11 pr-4 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none focus:border-[#135391] focus-visible:ring-2 focus-visible:ring-[#135391]/30"
            />
          </div>
          <FilterSelect
            label="Filter by rating"
            value={ratingFilter}
            onChange={(value) => changeFilter({ rating: value === "all" ? null : value })}
            options={RATING_FILTERS.map((r) => ({
              value: r,
              label: r === "all" ? "All ratings" : `${r} star${r === "1" ? "" : "s"}`,
            }))}
          />
          <FilterSelect
            label="Sort reviews"
            value={sort}
            onChange={(value) => changeFilter({ sort: value === "newest" ? null : value })}
            options={(Object.keys(SORTS) as SortKey[]).map((key) => ({ value: key, label: SORTS[key] }))}
          />
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
          {STATUS_FILTERS.map((status) => {
            const isActive = statusFilter === status;
            const label =
              status === "all"
                ? "All"
                : status === "published"
                  ? t("admin.reviews.category.published")
                  : t("admin.reviews.status.hidden");
            return (
              <button
                key={status}
                type="button"
                aria-pressed={isActive}
                onClick={() => changeFilter({ status: status === "all" ? null : status })}
                className={`rounded-lg border px-3 py-2 text-xs font-semibold font-satoshi transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#135391] ${
                  isActive
                    ? "border-[#135391] bg-[#F0F6FC] text-[#135391]"
                    : "border-[#E5E5E5] bg-white text-[#676565] hover:bg-[#FAFAFA]"
                }`}
              >
                {label} <span>({statusCounts[status]})</span>
              </button>
            );
          })}
        </div>

        {!isLoading ? (
          <p className="text-xs font-medium font-satoshi text-[#676565]" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? "review" : "reviews"}
            {hasFilters ? " match your filters" : ""}
          </p>
        ) : null}
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <ReviewSkeleton key={i} />)
        ) : pageRows.length > 0 ? (
          pageRows.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              selected={selectedIds.includes(review.id)}
              pending={pendingIds.includes(review.id)}
              onToggle={() => toggleSelected(review.id)}
              onAction={(action) => setConfirm({ kind: "single", action, review })}
            />
          ))
        ) : !loadError ? (
          <div className="rounded-xl border border-[#EEEEEE] bg-[#FAFAFA] p-10 text-center">
            <p className="text-sm font-medium font-satoshi text-[#676565]">
              {reviews.length === 0 ? "No reviews have been posted yet." : t("admin.reviews.empty")}
            </p>
            {hasFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-3 rounded-lg border border-[#E5E5E5] bg-white px-4 py-2 text-sm font-bold font-satoshi text-[#135391] hover:bg-[#F0F6FC] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#135391]"
              >
                Clear search and filters
              </button>
            ) : null}
          </div>
        ) : null}

        <Pagination
          page={page}
          pageCount={pageCount}
          total={filtered.length}
          onChange={(next) => {
            setSelectedIds([]);
            setUrl({ page: next === 1 ? null : next });
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </div>

      <AdminConfirmModal
        open={confirm !== null}
        title={confirmCopy?.title ?? ""}
        message={confirmCopy?.message ?? ""}
        confirmLabel={confirmCopy?.label ?? ""}
        cancelLabel="Cancel"
        destructive={confirm?.action === "hide"}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          if (!confirm) return;
          const ids = confirm.kind === "single" ? [confirm.review.id] : confirm.ids;
          void runAction(confirm.action, ids);
        }}
      />
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        aria-label={label}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full appearance-none rounded-lg border border-[#E5E5E5] bg-white pl-4 pr-10 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none focus:border-[#135391] focus-visible:ring-2 focus-visible:ring-[#135391]/30"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]" aria-hidden />
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          aria-hidden
          className={`h-3.5 w-3.5 ${i < rating ? "fill-[#FFCE31] text-[#FFCE31]" : "fill-zinc-200 text-zinc-200"}`}
        />
      ))}
    </span>
  );
}

function ReviewSkeleton() {
  return (
    <div className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm" aria-hidden>
      <div className="flex items-start gap-3">
        <SkeletonBlock className="mt-1 size-4" />
        <div className="flex-1 space-y-2">
          <SkeletonBlock className="h-4 w-1/2" />
          <SkeletonBlock className="h-3 w-1/3" />
          <SkeletonBlock className="h-3 w-5/6" />
          <SkeletonBlock className="h-7 w-24" />
        </div>
      </div>
    </div>
  );
}

function ReviewCard({
  review,
  selected,
  pending,
  onToggle,
  onAction,
}: {
  review: MarketplaceReview;
  selected: boolean;
  pending: boolean;
  onToggle: () => void;
  onAction: (action: Action) => void;
}) {
  const t = useTranslation();
  const title = review.listingTitle ?? "Removed listing";
  const category = review.listingCategory ? CATEGORY_LABELS[review.listingCategory] : null;

  return (
    <article
      className={`rounded-xl border bg-white p-5 shadow-sm transition-opacity ${
        selected ? "border-[#135391]" : "border-[#EEEEEE]"
      } ${pending ? "opacity-60" : ""}`}
      aria-busy={pending}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          disabled={pending}
          aria-label={t("admin.reviews.selectReview", { title })}
          className="mt-1 size-4 shrink-0 accent-[#135391] focus-visible:ring-2 focus-visible:ring-[#135391]"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold font-satoshi text-[#2F2F2F]">{title}</span>
            {category ? (
              <span className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-[#F5F5F5] text-[#676565]">
                {category}
              </span>
            ) : null}
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                review.status === "hidden" ? "bg-[#F5F5F5] text-[#676565]" : "bg-[#E8F5E9] text-[#2E7D32]"
              }`}
            >
              {review.status === "hidden" ? t("admin.reviews.status.hidden") : t("admin.reviews.status.published")}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm font-medium font-satoshi text-[#676565]">
            <Stars rating={review.rating} />
            <span>
              {review.customerName ?? "Guest"} · {review.rating}/5 · {review.vendorName ?? "—"}
            </span>
          </div>
          {review.comment ? (
            <p className="mt-2 whitespace-pre-line text-sm font-satoshi text-[#2F2F2F]">{review.comment}</p>
          ) : (
            <p className="mt-2 text-sm italic font-satoshi text-[#9E9E9E]">No written comment.</p>
          )}
          <p className="mt-2 text-xs font-medium font-satoshi text-[#9E9E9E]">
            {formatDate(review.createdAt)}
            {review.customerEmail ? ` · ${review.customerEmail}` : ""}
            {review.bookingReference ? ` · Booking ${review.bookingReference}` : ""}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {review.status === "published" ? (
              <button
                type="button"
                onClick={() => onAction("hide")}
                disabled={pending}
                className="rounded-lg border border-[#C0392B] px-3 py-1.5 text-xs font-bold font-satoshi text-[#C0392B] transition-colors hover:bg-[#FDEBEB] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C0392B] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pending ? "Saving…" : t("admin.reviews.hide")}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onAction("publish")}
                disabled={pending}
                className="rounded-lg border border-[#2E7D32] px-3 py-1.5 text-xs font-bold font-satoshi text-[#2E7D32] transition-colors hover:bg-[#E8F5E9] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D32] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pending ? "Saving…" : t("admin.reviews.publish")}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
