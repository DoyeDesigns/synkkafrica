"use client";

import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  MoreVertical,
  Search,
  X,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  adminApproveListing,
  adminListListings,
  adminRejectListing,
  adminRemoveListing,
  type AdminListing,
} from "@/lib/api/admin";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";
import { LIVE_QUERY_OPTIONS } from "@/lib/live-query-options";

const STATUS_TABS = ["all", "pending", "live", "paused", "rejected"] as const;
type StatusTab = (typeof STATUS_TABS)[number];

const SORT_KEYS = ["title", "bookings", "rating", "created"] as const;
type SortKey = (typeof SORT_KEYS)[number];
type SortDir = "asc" | "desc";

const PAGE_SIZE = 20;

const STATUS_STYLES: Record<AdminListing["status"], string> = {
  draft: "bg-[#EEEEEE] text-[#5A5A5A]",
  pending: "bg-[#FDF3EF] text-[#D85A30]",
  live: "bg-[#E7F6EC] text-[#2E7D32]",
  paused: "bg-[#FFF4E5] text-[#9A7200]",
  rejected: "bg-[#FDEBEB] text-[#C0392B]",
};

type Category = AdminListing["category"];

const SEARCH_KEYS: Record<Category, TranslationKey> = {
  experiences: "admin.experiences.searchPlaceholder",
  cars: "admin.cars.searchPlaceholder",
  accommodations: "admin.accommodations.searchPlaceholder",
};

const NAME_KEYS: Record<Category, TranslationKey> = {
  experiences: "admin.experiences.name",
  cars: "admin.cars.name",
  accommodations: "admin.accommodations.name",
};

const DELETE_KEYS: Record<Category, TranslationKey> = {
  experiences: "admin.experiences.actions.delete",
  cars: "admin.cars.actions.delete",
  accommodations: "admin.accommodations.actions.delete",
};

const FOCUS_RING =
  "outline-none focus-visible:ring-2 focus-visible:ring-[#135391] focus-visible:ring-offset-1";

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

// dd MMM yyyy, e.g. "05 Oct 2026".
export function formatAdminDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function confirmRemoveListing(title: string): boolean {
  return window.confirm(
    `Remove "${title}" permanently?\n\nThis deletes the listing and all of its reviews and cannot be undone. The vendor will be notified.`,
  );
}

function isOneOf<T extends string>(list: readonly T[], v: string | null): v is T {
  return v !== null && (list as readonly string[]).includes(v);
}

// Skeleton matching the table layout; also used as the page's Suspense fallback.
export function AdminListingsSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <section className="space-y-6" aria-busy="true" aria-label="Loading listings">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 animate-pulse rounded bg-[#EEEEEE]" />
          <div className="h-4 w-72 animate-pulse rounded bg-[#F3F3F3]" />
        </div>
        <div className="h-11 w-full animate-pulse rounded-full bg-[#F3F3F3] sm:max-w-sm" />
      </div>
      <div className="flex gap-2">
        {STATUS_TABS.map((s) => (
          <div key={s} className="h-8 w-20 animate-pulse rounded-full bg-[#F3F3F3]" />
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-[#EEEEEE] bg-white shadow-sm">
        <div className="h-10 border-b border-[#F0F0F0] bg-[#FAFAFA]" />
        <SkeletonRows rows={rows} />
      </div>
    </section>
  );
}

function SkeletonRows({ rows }: { rows: number }) {
  return (
    <div className="divide-y divide-[#F0F0F0]">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-4">
          <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-[#EEEEEE]" />
          <div className="h-4 w-48 animate-pulse rounded bg-[#EEEEEE]" />
          <div className="h-4 w-28 animate-pulse rounded bg-[#F3F3F3]" />
          <div className="h-4 w-24 animate-pulse rounded bg-[#F3F3F3]" />
          <div className="ml-auto h-6 w-16 animate-pulse rounded-full bg-[#F3F3F3]" />
        </div>
      ))}
    </div>
  );
}

export function AdminListingsLiveContent({
  category,
  title,
}: {
  category?: Category;
  title: string;
}) {
  const t = useTranslation();
  const { data: session } = useSession();
  const token = session?.accessToken;
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // --- URL-backed view state (survives refresh / back) ---
  // `?status=` is what the dashboard's "needs attention" links use.
  const tabParam = searchParams.get("tab") ?? searchParams.get("status");
  const tab: StatusTab = isOneOf(STATUS_TABS, tabParam) ? tabParam : "all";
  const query = searchParams.get("q") ?? "";
  const sortParam = searchParams.get("sort");
  const sortKey: SortKey = isOneOf(SORT_KEYS, sortParam) ? sortParam : "created";
  const sortDir: SortDir = searchParams.get("dir") === "asc" ? "asc" : "desc";
  const pageParam = Number(searchParams.get("page") ?? "1");
  const removedTitle = searchParams.get("removed");

  const updateParams = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v === null || v === "") next.delete(k);
        else next.set(k, v);
      }
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  // Debounced search: the input is local, the URL (and filtering) follows ~250ms later.
  const [searchInput, setSearchInput] = useState(query);
  useEffect(() => {
    if (searchInput.trim() === query) return;
    const id = window.setTimeout(
      () => updateParams({ q: searchInput.trim() || null, page: null }),
      250,
    );
    return () => window.clearTimeout(id);
  }, [searchInput, query, updateParams]);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const closeMenu = useCallback(() => setOpenMenuId(null), []);

  const { data, isLoading, error: loadError, refetch, isFetching } = useQuery({
    queryKey: ["admin-listings", tab],
    queryFn: () =>
      adminListListings(token as string, tab === "all" ? undefined : tab),
    enabled: Boolean(token),
    ...LIVE_QUERY_OPTIONS,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
  };

  // Inline error tied to the row it came from (approve / reject / remove).
  const [rowError, setRowError] = useState<{ id: string; message: string } | null>(
    null,
  );
  const [success, setSuccess] = useState<string | null>(
    removedTitle ? `"${removedTitle}" was removed.` : null,
  );
  useEffect(() => {
    if (removedTitle) updateParams({ removed: null });
  }, [removedTitle, updateParams]);
  useEffect(() => {
    if (!success) return;
    const id = window.setTimeout(() => setSuccess(null), 5000);
    return () => window.clearTimeout(id);
  }, [success]);

  // Drop a listing from every cached tab immediately once the server confirms.
  const dropFromCache = (id: string) => {
    queryClient.setQueriesData<AdminListing[]>({ queryKey: ["admin-listings"] }, (old) =>
      old?.filter((l) => l.id !== id),
    );
  };

  const approveMutation = useMutation({
    mutationFn: (l: AdminListing) => adminApproveListing(token as string, l.id),
    onMutate: () => {
      setRowError(null);
      setSuccess(null);
    },
    onSuccess: (_res, l) => {
      setSuccess(`"${l.title}" is now live.`);
      invalidate();
    },
    onError: (err, l) => {
      setRowError({ id: l.id, message: errorMessage(err, "Couldn't approve this listing.") });
      invalidate();
    },
  });
  const rejectMutation = useMutation({
    mutationFn: (v: { listing: AdminListing; reason?: string }) =>
      adminRejectListing(token as string, v.listing.id, v.reason),
    onMutate: () => {
      setRowError(null);
      setSuccess(null);
    },
    onSuccess: (_res, v) => {
      setSuccess(`"${v.listing.title}" was rejected. The vendor has been notified.`);
      invalidate();
    },
    // 409 when the listing already left `pending`; refresh so it moves tabs.
    onError: (err, v) => {
      setRowError({
        id: v.listing.id,
        message: errorMessage(err, "Couldn't reject this listing."),
      });
      invalidate();
    },
  });
  const removeMutation = useMutation({
    mutationFn: (l: AdminListing) => adminRemoveListing(token as string, l.id),
    onMutate: () => {
      setRowError(null);
      setSuccess(null);
    },
    onSuccess: (_res, l) => {
      dropFromCache(l.id);
      queryClient.removeQueries({ queryKey: ["admin-listing", l.id] });
      setSuccess(`"${l.title}" was removed.`);
      invalidate();
    },
    // 409 when bookings are still in progress — the message says so.
    onError: (err, l) =>
      setRowError({ id: l.id, message: errorMessage(err, "Couldn't remove this listing.") }),
  });

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    const rows = (data ?? [])
      .filter((l) => !category || l.category === category)
      .filter(
        (l) =>
          !q ||
          [l.title, l.location, l.vendorName].some((v) =>
            (v ?? "").toLowerCase().includes(q),
          ),
      );
    const factor = sortDir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      let diff = 0;
      if (sortKey === "title") diff = a.title.localeCompare(b.title);
      else if (sortKey === "bookings") diff = a.bookingCount - b.bookingCount;
      else if (sortKey === "rating")
        diff = Number(a.ratingAvg) - Number(b.ratingAvg) || a.ratingCount - b.ratingCount;
      else diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return diff * factor;
    });
  }, [data, category, query, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Number.isFinite(pageParam)
    ? Math.min(Math.max(1, Math.floor(pageParam)), pageCount)
    : 1;
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const busyIds = new Set<string>(
    [
      approveMutation.isPending ? approveMutation.variables?.id : undefined,
      rejectMutation.isPending ? rejectMutation.variables?.listing.id : undefined,
      removeMutation.isPending ? removeMutation.variables?.id : undefined,
    ].filter((v): v is string => Boolean(v)),
  );
  const removingId = removeMutation.isPending ? removeMutation.variables?.id : undefined;

  const toggleSort = (key: SortKey) => {
    const dir: SortDir =
      sortKey === key ? (sortDir === "asc" ? "desc" : "asc") : key === "title" ? "asc" : "desc";
    updateParams({ sort: key, dir, page: null });
  };

  const clearFilters = () => {
    setSearchInput("");
    updateParams({ q: null, tab: null, page: null });
  };

  const hasFilters = Boolean(query) || tab !== "all";
  // Detail links carry the list's query so "Back" returns to the same view.
  const listQs = searchParams.toString();
  const detailHref = (id: string) =>
    `/admin/listings/${id}${listQs ? `?back=${encodeURIComponent(listQs)}` : ""}`;
  const showSkeleton = isLoading || (!token && !data);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-satoshi text-[#2F2F2F]">
            {title}
          </h1>
          <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
            Approve listings to make them visible to customers.
          </p>
        </div>
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]" />
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setSearchInput("");
            }}
            placeholder={category ? t(SEARCH_KEYS[category]) : "Search listings"}
            aria-label="Search by name, location or vendor"
            className="h-11 w-full rounded-full border border-[#E5E5E5] bg-white pl-11 pr-4 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none transition-colors focus:border-[#135391] focus-visible:ring-2 focus-visible:ring-[#135391]/30"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by status">
          {STATUS_TABS.map((s) => (
            <button
              key={s}
              type="button"
              role="tab"
              aria-selected={tab === s}
              onClick={() => updateParams({ tab: s === "all" ? null : s, page: null })}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold font-satoshi capitalize transition-colors ${FOCUS_RING} ${
                tab === s
                  ? "bg-[#135391] text-white"
                  : "border border-[#E5E5E5] bg-white text-[#676565] hover:bg-[#F5F5F5]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        {!showSkeleton && !loadError ? (
          <p className="text-sm font-medium font-satoshi text-[#676565]" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? "listing" : "listings"}
            {query ? ` matching "${query}"` : ""}
            {isFetching ? " · Refreshing…" : ""}
          </p>
        ) : null}
      </div>

      {success ? (
        <div
          role="status"
          className="flex items-start justify-between gap-3 rounded-lg border border-[#CDEBD5] bg-[#E7F6EC] px-4 py-3 text-sm font-medium font-satoshi text-[#2E7D32]"
        >
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
            {success}
          </span>
          <button
            type="button"
            onClick={() => setSuccess(null)}
            aria-label="Dismiss message"
            className={`shrink-0 rounded ${FOCUS_RING}`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {loadError ? (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-lg border border-[#F5C6C6] bg-[#FDEBEB] px-4 py-3 text-sm font-medium font-satoshi text-[#C0392B] sm:flex-row sm:items-center sm:justify-between"
        >
          <span>{errorMessage(loadError, "Couldn't load listings.")}</span>
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            className={`shrink-0 rounded-lg border border-[#C0392B] px-3 py-1.5 text-xs font-bold hover:bg-white disabled:opacity-60 ${FOCUS_RING}`}
          >
            {isFetching ? "Retrying…" : "Retry"}
          </button>
        </div>
      ) : null}

      <div className="max-h-[70vh] overflow-auto rounded-xl border border-[#EEEEEE] bg-white shadow-sm">
        <table className="min-w-[1120px] w-full text-left text-sm font-satoshi">
          <thead className="sticky top-0 z-10 border-b border-[#F0F0F0] bg-[#FAFAFA] text-xs font-semibold uppercase text-[#676565]">
            <tr>
              <SortHeader
                label={category ? t(NAME_KEYS[category]) : "Listing"}
                sortKey="title"
                active={sortKey}
                dir={sortDir}
                onSort={toggleSort}
                className="min-w-[240px]"
              />
              <th className="min-w-[160px] px-4 py-3">{t("admin.listings.location")}</th>
              <th className="min-w-[140px] px-4 py-3">{t("admin.listings.vendor")}</th>
              <SortHeader
                label={t("admin.listings.bookings")}
                sortKey="bookings"
                active={sortKey}
                dir={sortDir}
                onSort={toggleSort}
                className="min-w-[110px]"
                align="right"
              />
              <SortHeader
                label={t("admin.listings.ratings")}
                sortKey="rating"
                active={sortKey}
                dir={sortDir}
                onSort={toggleSort}
                className="min-w-[140px]"
                align="right"
              />
              <SortHeader
                label="Created"
                sortKey="created"
                active={sortKey}
                dir={sortDir}
                onSort={toggleSort}
                className="min-w-[120px]"
              />
              <th className="min-w-[180px] whitespace-nowrap px-4 py-3">Status</th>
              <th className="w-12 px-4 py-3">
                <span className="sr-only">{t("admin.common.actions")}</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F0F0]">
            {showSkeleton ? (
              <tr>
                <td colSpan={8} className="p-0">
                  <SkeletonRows rows={6} />
                </td>
              </tr>
            ) : pageRows.length > 0 ? (
              pageRows.map((l) => (
                <ListingRow
                  key={l.id}
                  listing={l}
                  href={detailHref(l.id)}
                  removeLabel={category ? t(DELETE_KEYS[category]) : "Remove listing"}
                  busy={busyIds.has(l.id)}
                  removing={removingId === l.id}
                  error={rowError?.id === l.id ? rowError.message : null}
                  isMenuOpen={openMenuId === l.id}
                  onMenuToggle={() =>
                    setOpenMenuId((current) => (current === l.id ? null : l.id))
                  }
                  onMenuClose={closeMenu}
                  onApprove={() => approveMutation.mutate(l)}
                  onReject={() => {
                    const reason = window.prompt(
                      `Reject "${l.title}"?\n\nReason for rejection (shown to the vendor):`,
                    );
                    // Cancelled prompt → don't reject.
                    if (reason === null) return;
                    rejectMutation.mutate({
                      listing: l,
                      reason: reason.trim() || undefined,
                    });
                  }}
                  onRemove={() => {
                    setOpenMenuId(null);
                    if (!confirmRemoveListing(l.title)) return;
                    removeMutation.mutate(l);
                  }}
                />
              ))
            ) : loadError ? null : (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <p className="text-sm font-bold font-satoshi text-[#2F2F2F]">
                    {query
                      ? `No listings match "${query}"`
                      : tab === "all"
                        ? "No listings yet"
                        : `No ${tab} listings`}
                  </p>
                  <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
                    {hasFilters
                      ? "Try a different search or status."
                      : "Listings appear here once vendors create them."}
                  </p>
                  {hasFilters ? (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className={`mt-4 rounded-lg border border-[#E5E5E5] px-4 py-2 text-sm font-bold font-satoshi text-[#135391] hover:bg-[#F5F5F5] ${FOCUS_RING}`}
                    >
                      Clear search & filters
                    </button>
                  ) : null}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!showSkeleton && filtered.length > PAGE_SIZE ? (
        <nav
          aria-label="Pagination"
          className="flex flex-col items-center justify-between gap-3 text-sm font-medium font-satoshi text-[#676565] sm:flex-row"
        >
          <span>
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
            {filtered.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => updateParams({ page: page - 1 <= 1 ? null : String(page - 1) })}
              aria-label="Previous page"
              className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E5E5] bg-white disabled:opacity-40 ${FOCUS_RING}`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-[#2F2F2F]">
              Page {page} of {pageCount}
            </span>
            <button
              type="button"
              disabled={page >= pageCount}
              onClick={() => updateParams({ page: String(page + 1) })}
              aria-label="Next page"
              className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E5E5] bg-white disabled:opacity-40 ${FOCUS_RING}`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </nav>
      ) : null}
    </section>
  );
}

function SortHeader({
  label,
  sortKey,
  active,
  dir,
  onSort,
  className = "",
  align = "left",
}: {
  label: string;
  sortKey: SortKey;
  active: SortKey;
  dir: SortDir;
  onSort: (key: SortKey) => void;
  className?: string;
  align?: "left" | "right";
}) {
  const isActive = active === sortKey;
  const Icon = isActive ? (dir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <th
      className={`px-4 py-3 ${align === "right" ? "text-right" : ""} ${className}`}
      aria-sort={isActive ? (dir === "asc" ? "ascending" : "descending") : "none"}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        aria-label={`Sort by ${label}`}
        className={`inline-flex items-center gap-1 rounded uppercase hover:text-[#2F2F2F] ${FOCUS_RING} ${
          isActive ? "text-[#2F2F2F]" : ""
        }`}
      >
        {label}
        <Icon className="h-3.5 w-3.5" aria-hidden />
      </button>
    </th>
  );
}

function ListingRow({
  listing,
  href,
  removeLabel,
  busy,
  removing,
  error,
  isMenuOpen,
  onMenuToggle,
  onMenuClose,
  onApprove,
  onReject,
  onRemove,
}: {
  listing: AdminListing;
  href: string;
  removeLabel: string;
  busy: boolean;
  removing: boolean;
  error: string | null;
  isMenuOpen: boolean;
  onMenuToggle: () => void;
  onMenuClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  onRemove: () => void;
}) {
  const t = useTranslation();
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) onMenuClose();
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onMenuClose();
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isMenuOpen, onMenuClose]);

  return (
    <tr className={`transition-opacity hover:bg-[#FCFCFC] ${busy ? "opacity-60" : ""}`}>
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#F5F5F5]">
            {listing.coverImageUrl ? (
              // Vendor uploads can live on any host, so skip next/image here.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={listing.coverImageUrl}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : (
              <ImageIcon className="h-4 w-4 text-[#B0B0B0]" aria-hidden />
            )}
          </div>
          <div className="min-w-0">
            <Link
              href={href}
              className={`rounded font-bold text-[#135391] underline underline-offset-2 hover:text-[#004785] ${FOCUS_RING}`}
            >
              {listing.title}
            </Link>
            {listing.status === "rejected" && listing.rejectionReason ? (
              <p className="mt-0.5 text-xs font-medium text-[#C0392B]">
                {listing.rejectionReason}
              </p>
            ) : null}
            {error ? (
              <p role="alert" className="mt-0.5 text-xs font-medium text-[#C0392B]">
                {error}
              </p>
            ) : null}
          </div>
        </div>
      </td>
      <td className="px-4 py-4 font-medium whitespace-nowrap text-[#676565]">
        {listing.location ?? "—"}
      </td>
      <td className="px-4 py-4 font-medium whitespace-nowrap text-[#2F2F2F]">
        <Link
          href={`/admin/vendors/${listing.vendorId}`}
          className={`rounded hover:underline ${FOCUS_RING}`}
        >
          {listing.vendorName ?? "—"}
        </Link>
      </td>
      <td className="px-4 py-4 text-right font-medium tabular-nums text-[#2F2F2F]">
        {listing.bookingCount.toLocaleString()}
      </td>
      <td className="px-4 py-4 text-right whitespace-nowrap tabular-nums">
        <span className="font-semibold text-[#D85A30]">
          {listing.ratingCount > 0 ? Number(listing.ratingAvg).toFixed(1) : "—"}
        </span>
        <span className="text-[#676565]">
          {" "}
          ({listing.ratingCount} {t("admin.listings.reviews")})
        </span>
      </td>
      <td className="px-4 py-4 font-medium whitespace-nowrap text-[#676565]">
        {formatAdminDate(listing.createdAt)}
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap capitalize ${STATUS_STYLES[listing.status]}`}
          >
            {removing ? "Removing…" : listing.status}
          </span>
          {listing.status === "pending" && !removing ? (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={onApprove}
                aria-label={`Approve ${listing.title}`}
                className={`rounded-lg bg-[#2E7D32] px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60 ${FOCUS_RING}`}
              >
                Approve
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={onReject}
                aria-label={`Reject ${listing.title}`}
                className={`rounded-lg border border-[#E5E5E5] px-3 py-1.5 text-xs font-bold text-[#C0392B] disabled:opacity-60 ${FOCUS_RING}`}
              >
                Reject
              </button>
            </>
          ) : null}
        </div>
      </td>
      <td className="relative px-4 py-4">
        <div ref={menuRef} className="relative flex justify-end">
          <button
            ref={triggerRef}
            type="button"
            onClick={onMenuToggle}
            aria-expanded={isMenuOpen}
            aria-haspopup="menu"
            aria-label={`Actions for ${listing.title}`}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#676565] transition-colors hover:bg-[#F5F5F5] ${FOCUS_RING}`}
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {isMenuOpen ? (
            <div
              role="menu"
              className="absolute right-0 top-full z-20 mt-1 min-w-[180px] overflow-hidden rounded-lg border border-[#EEEEEE] bg-white py-1 shadow-lg"
            >
              <Link
                href={href}
                role="menuitem"
                onClick={onMenuClose}
                className="block px-4 py-2.5 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none transition-colors hover:bg-[#FAFAFA] focus-visible:bg-[#F0F4FA]"
              >
                {t("admin.listings.viewDetails")}
              </Link>
              <button
                type="button"
                role="menuitem"
                disabled={busy}
                onClick={onRemove}
                className="block w-full px-4 py-2.5 text-left text-sm font-medium font-satoshi text-[#DD2222] outline-none transition-colors hover:bg-[#FFF5F5] focus-visible:bg-[#FFF5F5] disabled:opacity-60"
              >
                {removing ? "Removing…" : removeLabel}
              </button>
            </div>
          ) : null}
        </div>
      </td>
    </tr>
  );
}
