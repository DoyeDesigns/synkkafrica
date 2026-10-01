"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Mail, Phone, Search, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCallback, useMemo, useState } from "react";

import {
  ADMIN_LIST_PAGE_SIZE,
  clampPage,
  ErrorBanner,
  errorMessage,
  formatDate,
  formatDateTime,
  formatMoney,
  NoticeBanner,
  Pagination,
  SkeletonBlock,
  useEscapeKey,
  useUrlSearch,
  useUrlState,
  type Notice,
} from "@/features/admin/components/admin-marketplace-list-kit";
import { useTranslation } from "@/hooks/use-translation";
import {
  cancelMarketplaceBooking,
  getMarketplaceBooking,
  listMarketplaceBookings,
  type MarketplaceBooking,
  type MarketplaceBookingStatus,
} from "@/lib/api/admin/marketplace-bookings";
import { LIVE_QUERY_OPTIONS } from "@/lib/live-query-options";
import type { TranslationKey } from "@/lib/preferences/translations";

// --- Filters -----------------------------------------------------------------

const PRODUCT_TYPES = ["car", "accommodation", "experience"] as const;
type ProductType = (typeof PRODUCT_TYPES)[number];

const PRODUCT_LABEL_KEYS: Record<ProductType, TranslationKey> = {
  car: "admin.bookings.product.cars",
  accommodation: "admin.bookings.product.accommodations",
  experience: "admin.bookings.product.experiences",
};

const PRODUCT_TAG_STYLES: Record<ProductType, string> = {
  accommodation: "bg-[#F3E5F5] text-[#7B1FA2]",
  car: "bg-[#E3F2FD] text-[#1565C0]",
  experience: "bg-[#E8F5E9] text-[#2E7D32]",
};

const STATUS_FILTERS = [
  "all",
  "upcoming",
  "awaiting_confirmation",
  "confirmed",
  "completed",
  "declined",
  "cancelled",
] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const STATUS_BADGE_STYLES: Record<MarketplaceBookingStatus, string> = {
  awaiting_confirmation: "bg-[#FFF3E0] text-[#E65100]",
  confirmed: "bg-[#E8F5E9] text-[#2E7D32]",
  completed: "bg-[#F5F5F5] text-[#676565]",
  cancelled: "bg-[#FDEBEB] text-[#C0392B]",
  declined: "bg-[#FDEBEB] text-[#C0392B]",
};

const DATE_RANGES = ["day", "week", "month", "six_months", "year", "all"] as const;
type DateRange = (typeof DATE_RANGES)[number];

const DATE_RANGE_KEYS: Record<DateRange, TranslationKey> = {
  day: "admin.bookings.dateRange.day",
  week: "admin.bookings.dateRange.week",
  month: "admin.bookings.dateRange.month",
  six_months: "admin.bookings.dateRange.sixMonths",
  year: "admin.bookings.dateRange.year",
  all: "admin.bookings.dateRange.all",
};

const RANGE_DAYS: Record<Exclude<DateRange, "all">, number> = {
  day: 1,
  week: 7,
  month: 30,
  six_months: 183,
  year: 365,
};

const SORTS = {
  newest: "Newest booked",
  oldest: "Oldest booked",
  start_asc: "Trip date (soonest)",
  start_desc: "Trip date (latest)",
  amount_desc: "Amount (high to low)",
  amount_asc: "Amount (low to high)",
} as const;
type SortKey = keyof typeof SORTS;

const DAY_MS = 24 * 60 * 60 * 1000;

function pick<T extends string>(value: string, allowed: readonly T[], fallback: T): T {
  return (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

function isProductType(value: string | null): value is ProductType {
  return value !== null && (PRODUCT_TYPES as readonly string[]).includes(value);
}

function startMs(b: MarketplaceBooking): number {
  return new Date(b.startDate ? `${b.startDate}T00:00:00Z` : b.createdAt).getTime();
}

// Upcoming = still going ahead and starts within the next 7 days.
function isUpcoming(b: MarketplaceBooking, now: number): boolean {
  if (b.status !== "awaiting_confirmation" && b.status !== "confirmed") return false;
  if (!b.startDate) return false;
  const start = startMs(b);
  return start >= now - DAY_MS && start <= now + 7 * DAY_MS;
}

// Same rule as the approved mock: the trip date lies within N days of today.
function inDateRange(b: MarketplaceBooking, range: DateRange, now: number): boolean {
  if (range === "all") return true;
  return Math.abs(startMs(b) - now) / DAY_MS <= RANGE_DAYS[range];
}

function matchesStatus(b: MarketplaceBooking, status: StatusFilter, now: number): boolean {
  if (status === "all") return true;
  if (status === "upcoming") return isUpcoming(b, now);
  return b.status === status;
}

function matchesQuery(b: MarketplaceBooking, q: string): boolean {
  if (!q) return true;
  return [
    b.bookingReference,
    b.listingTitle,
    b.customerName,
    b.customerEmail,
    b.customerPhone,
    b.vendorName,
    b.vendorEmail,
  ].some((field) => field?.toLowerCase().includes(q));
}

function sortBookings(rows: MarketplaceBooking[], sort: SortKey): MarketplaceBooking[] {
  const sorted = [...rows];
  const created = (b: MarketplaceBooking) => new Date(b.createdAt).getTime();
  switch (sort) {
    case "oldest":
      return sorted.sort((a, b) => created(a) - created(b));
    case "start_asc":
      return sorted.sort((a, b) => startMs(a) - startMs(b));
    case "start_desc":
      return sorted.sort((a, b) => startMs(b) - startMs(a));
    case "amount_desc":
      return sorted.sort((a, b) => b.amount - a.amount);
    case "amount_asc":
      return sorted.sort((a, b) => a.amount - b.amount);
    default:
      return sorted.sort((a, b) => created(b) - created(a));
  }
}

// --- Page --------------------------------------------------------------------

export function AdminBookingsLiveContent() {
  const t = useTranslation();
  const { data: session } = useSession();
  const token = session?.accessToken;
  const url = useUrlState();
  const [now] = useState(() => Date.now());
  const [notice, setNotice] = useState<Notice | null>(null);
  const clearNotice = useCallback(() => setNotice(null), []);

  const productParam = url.get("type");
  const productFilter: ProductType | "all" = isProductType(productParam) ? productParam : "all";
  const statusFilter = pick<StatusFilter>(url.get("status"), STATUS_FILTERS, "all");
  const dateRange = pick<DateRange>(url.get("range"), DATE_RANGES, "all");
  const sort = pick<SortKey>(url.get("sort"), Object.keys(SORTS) as SortKey[], "newest");
  const selectedParam = url.get("booking");

  const setUrl = url.set;
  const [searchInput, setSearchInput, query] = useUrlSearch(url);

  const {
    data,
    isLoading,
    error: loadError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["admin-marketplace-bookings"],
    queryFn: () => listMarketplaceBookings(token as string),
    enabled: Boolean(token),
    ...LIVE_QUERY_OPTIONS,
  });
  const bookings = useMemo(() => data ?? [], [data]);

  // Base set for stats and chip counts: everything except the status filter.
  const baseFiltered = useMemo(
    () =>
      bookings.filter(
        (b) =>
          inDateRange(b, dateRange, now) &&
          (productFilter === "all" || b.productType === productFilter) &&
          matchesQuery(b, query),
      ),
    [bookings, dateRange, now, productFilter, query],
  );

  const filterCounts = useMemo(() => {
    const counts = {} as Record<StatusFilter, number>;
    for (const f of STATUS_FILTERS) {
      counts[f] = baseFiltered.filter((b) => matchesStatus(b, f, now)).length;
    }
    return counts;
  }, [baseFiltered, now]);

  const stats = useMemo(() => {
    const inRange = bookings.filter((b) => inDateRange(b, dateRange, now));
    const monthStart = new Date(now);
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    return {
      upcoming: inRange.filter((b) => isUpcoming(b, now)).length,
      awaiting: inRange.filter((b) => b.status === "awaiting_confirmation").length,
      confirmed: inRange.filter((b) => b.status === "confirmed").length,
      declined: inRange.filter((b) => b.status === "declined").length,
      thisMonth: bookings.filter(
        (b) => new Date(b.createdAt).getTime() >= monthStart.getTime(),
      ).length,
    };
  }, [bookings, dateRange, now]);

  const filtered = useMemo(
    () =>
      sortBookings(
        baseFiltered.filter((b) => matchesStatus(b, statusFilter, now)),
        sort,
      ),
    [baseFiltered, now, sort, statusFilter],
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / ADMIN_LIST_PAGE_SIZE));
  const page = clampPage(url.get("page", "1"), pageCount);
  const pageRows = filtered.slice(
    (page - 1) * ADMIN_LIST_PAGE_SIZE,
    page * ADMIN_LIST_PAGE_SIZE,
  );

  // Desktop shows the selected booking (or the first on the page) beside the
  // list; smaller screens open it as a drawer only when one is picked.
  const selectedBooking =
    bookings.find((b) => b.id === selectedParam) ?? pageRows[0] ?? null;
  const drawerOpen = Boolean(selectedParam) && Boolean(selectedBooking);
  const closeDrawer = useCallback(() => setUrl({ booking: null }), [setUrl]);
  useEscapeKey(drawerOpen, closeDrawer);

  const hasFilters =
    Boolean(query) || productFilter !== "all" || statusFilter !== "all" || dateRange !== "all";
  const clearFilters = () => {
    setSearchInput("");
    setUrl({ q: null, type: null, status: null, range: null, page: null });
  };

  const statusLabel = useStatusLabel();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-bold font-satoshi text-[#2F2F2F]">
            {t("admin.bookings.title")}
          </h2>
          <p className="mt-1 max-w-3xl text-sm font-medium font-satoshi text-[#676565]">
            All marketplace bookings across Cars, Stays and Experiences.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <DateRangeFilter
            value={dateRange}
            onChange={(value) =>
              setUrl({ range: value === "all" ? null : value, page: null })
            }
          />
        </div>
      </div>

      <NoticeBanner notice={notice} onDismiss={clearNotice} />

      {loadError ? (
        <ErrorBanner
          message={errorMessage(loadError, "Couldn't load bookings.")}
          onRetry={() => void refetch()}
          retrying={isRefetching}
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-[#EEEEEE] bg-white px-4 py-3 shadow-sm">
              <SkeletonBlock className="h-7 w-12" />
              <SkeletonBlock className="mt-2 h-3 w-28" />
            </div>
          ))
        ) : (
          <>
            <StatCard label={t("admin.bookings.stats.upcoming")} value={stats.upcoming} valueClassName="text-[#135391]" />
            <StatCard label={t("admin.bookings.stats.awaiting")} value={stats.awaiting} valueClassName="text-[#D85A30]" />
            <StatCard label={t("admin.bookings.stats.confirmed")} value={stats.confirmed} valueClassName="text-[#2E7D32]" />
            <StatCard label="Declined by vendor" value={stats.declined} valueClassName="text-[#DD2222]" />
            <StatCard label={t("admin.bookings.stats.totalMonth")} value={stats.thisMonth} valueClassName="text-[#2F2F2F]" />
          </>
        )}
      </div>

      <div className="space-y-4 rounded-xl border border-[#EEEEEE] bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_repeat(2,minmax(0,0.8fr))]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]" aria-hidden />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder={t("admin.bookings.searchPlaceholder")}
              aria-label="Search bookings"
              className="h-11 w-full rounded-full border border-[#E5E5E5] bg-white pl-11 pr-4 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none focus:border-[#135391] focus-visible:ring-2 focus-visible:ring-[#135391]/30"
            />
          </div>

          <FilterSelect
            label="Product type"
            value={productFilter}
            onChange={(value) => setUrl({ type: value === "all" ? null : value, page: null })}
            options={[
              { value: "all", label: t("admin.bookings.product.all") },
              ...PRODUCT_TYPES.map((type) => ({ value: type, label: t(PRODUCT_LABEL_KEYS[type]) })),
            ]}
          />

          <FilterSelect
            label="Sort bookings"
            value={sort}
            onChange={(value) => setUrl({ sort: value === "newest" ? null : value, page: null })}
            options={(Object.keys(SORTS) as SortKey[]).map((key) => ({ value: key, label: SORTS[key] }))}
          />
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              aria-pressed={statusFilter === filter}
              onClick={() => setUrl({ status: filter === "all" ? null : filter, page: null })}
              className={`rounded-full px-3 py-1.5 text-xs font-bold font-satoshi transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#135391] ${
                statusFilter === filter
                  ? "bg-[#2F2F2F] text-white"
                  : "border border-[#E5E5E5] bg-white text-[#676565] hover:bg-[#FAFAFA]"
              }`}
            >
              {filterLabel(t, filter, filterCounts[filter])}
            </button>
          ))}
        </div>

        {!isLoading ? (
          <p className="text-xs font-medium font-satoshi text-[#676565]" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? "booking" : "bookings"}
            {hasFilters ? " match your filters" : ""}
          </p>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <BookingCardSkeleton key={i} />)
          ) : pageRows.length > 0 ? (
            pageRows.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                statusLabel={statusLabel(booking.status)}
                isSelected={selectedBooking?.id === booking.id}
                onSelect={() => setUrl({ booking: booking.id })}
              />
            ))
          ) : !loadError ? (
            <div className="rounded-xl border border-[#EEEEEE] bg-white px-5 py-10 text-center shadow-sm">
              <p className="text-sm font-medium text-[#676565]">
                {bookings.length === 0 ? "No marketplace bookings yet." : t("admin.bookings.empty")}
              </p>
              {hasFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-3 rounded-lg border border-[#E5E5E5] px-4 py-2 text-sm font-bold font-satoshi text-[#135391] hover:bg-[#F0F6FC] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#135391]"
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
              setUrl({ page: next === 1 ? null : next });
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </div>

        {selectedBooking ? (
          <div className="hidden xl:block">
            <BookingDetail
              key={selectedBooking.id}
              booking={selectedBooking}
              token={token}
              onNotice={setNotice}
            />
          </div>
        ) : null}
      </div>

      {drawerOpen && selectedBooking ? (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/40 xl:hidden"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeDrawer();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Booking ${selectedBooking.bookingReference}`}
            className="h-full w-full max-w-md overflow-y-auto bg-white shadow-xl"
          >
            <div className="flex justify-end border-b border-[#F0F0F0] p-2">
              <button
                type="button"
                onClick={closeDrawer}
                aria-label="Close booking details"
                className="rounded-lg p-2 text-[#676565] hover:bg-[#FAFAFA] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#135391]"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <BookingDetail
              key={selectedBooking.id}
              booking={selectedBooking}
              token={token}
              onNotice={setNotice}
              inDrawer
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function useStatusLabel() {
  const t = useTranslation();
  return useCallback(
    (status: MarketplaceBookingStatus): string => {
      switch (status) {
        case "awaiting_confirmation":
          return t("admin.bookings.status.awaiting");
        case "confirmed":
          return t("admin.bookings.status.confirmed");
        case "completed":
          return t("admin.bookings.status.completed");
        case "cancelled":
          return t("admin.bookings.status.cancelled");
        default:
          return "Declined";
      }
    },
    [t],
  );
}

function filterLabel(
  t: ReturnType<typeof useTranslation>,
  filter: StatusFilter,
  count: number,
): string {
  switch (filter) {
    case "all":
      return t("admin.bookings.filter.all", { count });
    case "upcoming":
      return t("admin.bookings.filter.upcoming", { count });
    case "awaiting_confirmation":
      return t("admin.bookings.filter.awaiting", { count });
    case "confirmed":
      return t("admin.bookings.filter.confirmed", { count });
    case "completed":
      return t("admin.bookings.filter.completed", { count });
    case "cancelled":
      return t("admin.bookings.filter.cancelled", { count });
    default:
      return `Declined (${count})`;
  }
}

function productLabel(t: ReturnType<typeof useTranslation>, type: string | null): string {
  return isProductType(type) ? t(PRODUCT_LABEL_KEYS[type]) : type ?? "Booking";
}

// --- Pieces ------------------------------------------------------------------

function StatCard({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: number;
  valueClassName: string;
}) {
  return (
    <div className="rounded-xl border border-[#EEEEEE] bg-white px-4 py-3 shadow-sm">
      <p className={`text-2xl font-bold font-inter ${valueClassName}`}>{value}</p>
      <p className="mt-1 text-xs font-medium font-satoshi text-[#676565]">{label}</p>
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

function DateRangeFilter({
  value,
  onChange,
}: {
  value: DateRange;
  onChange: (value: DateRange) => void;
}) {
  const t = useTranslation();
  return (
    <div className="relative flex h-11 min-w-[200px] items-center rounded-lg border border-[#E5E5E5] bg-white pl-4 pr-10 focus-within:ring-2 focus-within:ring-[#135391]/30 sm:min-w-[240px]">
      <p className="pointer-events-none text-sm font-medium font-satoshi text-[#2F2F2F]">
        {t("admin.bookings.dateRange.label")}: {t(DATE_RANGE_KEYS[value])}
      </p>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]" aria-hidden />
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as DateRange)}
        aria-label={t("admin.bookings.dateRange.label")}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {DATE_RANGES.map((range) => (
          <option key={range} value={range}>
            {t(DATE_RANGE_KEYS[range])}
          </option>
        ))}
      </select>
    </div>
  );
}

function BookingCardSkeleton() {
  return (
    <div className="rounded-xl border border-[#EEEEEE] bg-white p-4 shadow-sm" aria-hidden>
      <div className="flex justify-between gap-4">
        <div className="flex-1 space-y-2">
          <SkeletonBlock className="h-4 w-20" />
          <SkeletonBlock className="h-4 w-2/3" />
          <SkeletonBlock className="h-3 w-5/6" />
          <SkeletonBlock className="h-3 w-1/3" />
        </div>
        <div className="space-y-2">
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function BookingCard({
  booking,
  statusLabel,
  isSelected,
  onSelect,
}: {
  booking: MarketplaceBooking;
  statusLabel: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const t = useTranslation();
  const tagStyle = isProductType(booking.productType)
    ? PRODUCT_TAG_STYLES[booking.productType]
    : "bg-[#F5F5F5] text-[#676565]";
  const dates = booking.endDate
    ? `${formatDate(booking.startDate)} – ${formatDate(booking.endDate)}`
    : formatDate(booking.startDate);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={isSelected ? "true" : undefined}
      className={`w-full rounded-xl border bg-white p-4 text-left shadow-sm transition-colors hover:bg-[#FAFAFA] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#135391] ${
        isSelected ? "border-[#135391] xl:ring-1 xl:ring-[#135391]" : "border-[#EEEEEE]"
      }`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${tagStyle}`}>
              {productLabel(t, booking.productType)}
            </span>
            <span className="text-xs font-medium text-[#9E9E9E]">
              {booking.bookingReference} &bull; Booked {formatDate(booking.createdAt)}
            </span>
          </div>

          <p className="mt-2 font-bold font-satoshi text-[#2F2F2F]">{booking.listingTitle}</p>
          <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
            {booking.customerName ?? "Guest"}
            {booking.customerEmail ? <> &bull; {booking.customerEmail}</> : null} &bull; {dates} &bull;{" "}
            {booking.guestCount} {t("admin.bookings.guests")}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-medium font-satoshi text-[#676565]">
            <span>
              {t("admin.bookings.vendor")}: {booking.vendorName ?? "—"}
            </span>
          </div>
        </div>

        <div className="shrink-0 text-left lg:min-w-[140px] lg:text-right">
          <p className="font-bold font-satoshi tabular-nums text-[#2F2F2F]">
            {formatMoney(booking.amount, booking.currency)}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5 lg:justify-end">
            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${STATUS_BADGE_STYLES[booking.status]}`}>
              {statusLabel}
            </span>
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${
                booking.paymentSecured ? "bg-[#E7F6EC] text-[#2E7D32]" : "bg-[#FFF4E5] text-[#9A7200]"
              }`}
            >
              {booking.paymentSecured ? "Paid" : "Unpaid"}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

function BookingDetail({
  booking,
  token,
  onNotice,
  inDrawer = false,
}: {
  booking: MarketplaceBooking;
  token: string | undefined;
  onNotice: (notice: Notice) => void;
  inDrawer?: boolean;
}) {
  const t = useTranslation();
  const statusLabel = useStatusLabel();
  const queryClient = useQueryClient();
  const [cancelOpen, setCancelOpen] = useState(false);

  const {
    data: detail,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["admin-marketplace-booking", booking.id],
    queryFn: () => getMarketplaceBooking(token as string, booking.id),
    enabled: Boolean(token),
    ...LIVE_QUERY_OPTIONS,
  });

  const cancelMutation = useMutation({
    mutationFn: (reason: string) =>
      cancelMarketplaceBooking(token as string, booking.id, reason.trim() || undefined),
    onSuccess: async () => {
      setCancelOpen(false);
      onNotice({
        tone: "success",
        message: `Booking ${booking.bookingReference} cancelled. The customer and vendor were notified.${
          booking.paymentSecured ? " Refund the customer's payment from Refunds." : ""
        }`,
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-marketplace-bookings"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-marketplace-booking", booking.id] }),
      ]);
    },
  });

  const b = detail ?? booking;
  const canCancel = b.status === "awaiting_confirmation";
  const charged =
    b.chargeCurrency && b.chargeAmount != null
      ? formatMoney(b.chargeAmount, b.chargeCurrency)
      : formatMoney(b.amount, b.currency);

  return (
    <aside
      className={
        inDrawer
          ? "bg-white"
          : "sticky top-6 h-fit rounded-xl border border-[#EEEEEE] bg-white shadow-sm"
      }
    >
      <div className="border-b border-[#F0F0F0] p-5">
        <h3 className="text-base font-bold font-satoshi text-[#2F2F2F]">
          {b.listingTitle} &mdash; {b.bookingReference}
        </h3>
        <p className="mt-2 text-sm font-medium font-satoshi text-[#676565]">
          {productLabel(t, b.productType)} &bull; {statusLabel(b.status)} &bull; Booked{" "}
          {formatDate(b.createdAt)}
        </p>
      </div>

      <div className={`space-y-5 p-5 ${inDrawer ? "" : "max-h-[calc(100vh-14rem)] overflow-y-auto"}`}>
        {error ? (
          <ErrorBanner
            message={errorMessage(error, "Couldn't load the booking details.")}
            onRetry={() => void refetch()}
            retrying={isRefetching}
          />
        ) : null}

        <SidebarSection title={t("admin.bookings.sidebar.customer")}>
          <SidebarField label={t("admin.bookings.sidebar.name")} value={b.customerName ?? "Guest"} />
          <SidebarField label="Email" value={b.customerEmail ?? "—"} />
          <SidebarField label="Phone" value={b.customerPhone ?? "—"} />
          <SidebarField label="Account" value={b.customerUserId ? "Registered customer" : "Guest checkout"} />
        </SidebarSection>

        <SidebarSection title={t("admin.bookings.sidebar.vendor")}>
          <SidebarField label={t("admin.bookings.sidebar.assignedTo")} value={b.vendorName ?? "—"} />
          <SidebarField label="Email" value={b.vendorEmail ?? "—"} />
          <SidebarField label={t("admin.bookings.sidebar.vendorContact")} value={b.vendorPhone ?? "—"} />
        </SidebarSection>

        <SidebarSection title={t("admin.bookings.sidebar.bookingDetails")}>
          <SidebarField
            label={b.productType === "accommodation" ? t("admin.bookings.sidebar.checkIn") : "Start date"}
            value={`${formatDate(b.startDate)}${b.startTime ? ` · ${b.startTime}` : ""}`}
          />
          {b.endDate ? (
            <SidebarField
              label={b.productType === "accommodation" ? t("admin.bookings.sidebar.checkOut") : "End date"}
              value={formatDate(b.endDate)}
            />
          ) : null}
          <SidebarField label="Guests" value={String(b.guestCount)} />
          {b.roomName ? <SidebarField label="Room" value={`${b.roomName} × ${b.roomCount}`} /> : null}
          {detail?.carRentalMode ? <SidebarField label="Rental mode" value={detail.carRentalMode} /> : null}
          {detail?.pickupAddress ? <SidebarField label="Pickup" value={detail.pickupAddress} /> : null}
          {detail?.deliveryAddress ? <SidebarField label="Delivery" value={detail.deliveryAddress} /> : null}
          {detail?.specialRequests ? <SidebarField label="Special requests" value={detail.specialRequests} /> : null}
          {detail?.declineReason ? <SidebarField label="Decline reason" value={detail.declineReason} /> : null}
          <SidebarField label="Vendor price" value={formatMoney(b.subtotal, b.currency)} />
          <SidebarField label="Service fee" value={formatMoney(b.fees, b.currency)} />
          <SidebarField label={t("admin.bookings.sidebar.amount")} value={formatMoney(b.amount, b.currency)} />
        </SidebarSection>

        <SidebarSection title={t("admin.bookings.sidebar.payment")}>
          <SidebarField label={t("admin.bookings.sidebar.paymentStatus")} value={b.paymentSecured ? "Paid" : "Unpaid"} />
          {b.paidAt ? <SidebarField label="Paid on" value={formatDateTime(b.paidAt)} /> : null}
          {b.paymentProvider ? <SidebarField label="Provider" value={b.paymentProvider} /> : null}
          {detail?.paymentReference ? <SidebarField label="Reference" value={detail.paymentReference} /> : null}
          <SidebarField
            label={t("admin.bookings.sidebar.chargedCurrency")}
            value={`${b.chargeCurrency ?? b.currency} · ${charged}`}
          />
        </SidebarSection>

        {detail && detail.ledger.length > 0 ? (
          <SidebarSection title="Vendor earnings">
            {detail.ledger.map((tx) => (
              <SidebarField
                key={tx.id}
                label={`${tx.type === "credit" ? "Credit" : "Debit"} · ${tx.status}`}
                value={formatMoney(tx.amount, tx.currency)}
              />
            ))}
          </SidebarSection>
        ) : null}

        <SidebarSection title={t("admin.bookings.sidebar.timeline")}>
          {isLoading ? (
            <div className="space-y-3" aria-hidden>
              <SkeletonBlock className="h-4 w-2/3" />
              <SkeletonBlock className="h-4 w-1/2" />
            </div>
          ) : detail ? (
            <ol className="space-y-4">
              {detail.timeline.map((event) => (
                <li key={`${event.label}-${event.at}`} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#135391]" />
                  <div>
                    <p className="text-sm font-medium font-satoshi text-[#2F2F2F]">{event.label}</p>
                    <p className="mt-0.5 text-xs font-medium text-[#9E9E9E]">{formatDateTime(event.at)}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : null}
        </SidebarSection>
      </div>

      <div className="space-y-3 border-t border-[#F0F0F0] p-5">
        <div className="grid grid-cols-2 gap-2">
          <ContactLink
            label={t("admin.bookings.contactCustomer")}
            email={b.customerEmail}
            phone={b.customerPhone}
            subject={`Your SynkAfrica booking ${b.bookingReference}`}
          />
          <ContactLink
            label={t("admin.bookings.contactVendor")}
            email={b.vendorEmail}
            phone={b.vendorPhone}
            subject={`SynkAfrica booking ${b.bookingReference}`}
          />
        </div>
        <button
          type="button"
          onClick={() => setCancelOpen(true)}
          disabled={!canCancel || cancelMutation.isPending}
          className="w-full rounded-lg border border-[#DD2222] bg-white px-3 py-2.5 text-sm font-bold font-satoshi text-[#DD2222] transition-colors hover:bg-[#FFF5F5] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DD2222] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel booking
        </button>
        {!canCancel ? (
          <p className="text-xs font-medium font-satoshi text-[#9E9E9E]">
            Only bookings awaiting vendor confirmation can be cancelled here.
          </p>
        ) : null}
      </div>

      {cancelOpen ? (
        <CancelBookingDialog
          booking={b}
          pending={cancelMutation.isPending}
          error={cancelMutation.error ? errorMessage(cancelMutation.error, "Couldn't cancel this booking.") : null}
          onConfirm={(reason) => cancelMutation.mutate(reason)}
          onClose={() => {
            if (cancelMutation.isPending) return;
            cancelMutation.reset();
            setCancelOpen(false);
          }}
        />
      ) : null}
    </aside>
  );
}

function ContactLink({
  label,
  email,
  phone,
  subject,
}: {
  label: string;
  email: string | null;
  phone: string | null;
  subject: string;
}) {
  const className =
    "inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#E5E5E5] bg-white px-3 py-2.5 text-sm font-bold font-satoshi text-[#2F2F2F] transition-colors hover:bg-[#FAFAFA] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#135391]";
  if (email) {
    return (
      <a href={`mailto:${email}?subject=${encodeURIComponent(subject)}`} className={className}>
        <Mail className="h-4 w-4" aria-hidden />
        {label}
      </a>
    );
  }
  if (phone) {
    return (
      <a href={`tel:${phone}`} className={className}>
        <Phone className="h-4 w-4" aria-hidden />
        {label}
      </a>
    );
  }
  return (
    <span className={`${className} cursor-not-allowed opacity-50`} title="No contact details on file">
      {label}
    </span>
  );
}

function CancelBookingDialog({
  booking,
  pending,
  error,
  onConfirm,
  onClose,
}: {
  booking: MarketplaceBooking;
  pending: boolean;
  error: string | null;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  useEscapeKey(true, onClose);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="cancel-booking-title"
        aria-describedby="cancel-booking-message"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <h3 id="cancel-booking-title" className="text-xl font-bold font-satoshi text-[#2F2F2F]">
          Cancel booking {booking.bookingReference}?
        </h3>
        <p id="cancel-booking-message" className="mt-2 text-sm font-medium font-satoshi leading-relaxed text-[#676565]">
          &ldquo;{booking.listingTitle}&rdquo; for {booking.customerName ?? "a guest"} will be cancelled and
          the dates released. The customer and vendor are notified in-app.
          {booking.paymentSecured
            ? " This booking is paid: refund the customer separately from Refunds."
            : ""}
        </p>
        <label className="mt-4 flex flex-col gap-2">
          <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
            Reason (shown to customer and vendor, optional)
          </span>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            maxLength={500}
            disabled={pending}
            className="min-h-[80px] w-full rounded-lg border border-[#E5E5E5] px-3 py-2 text-sm font-medium font-satoshi outline-none focus:border-[#135391] focus-visible:ring-2 focus-visible:ring-[#135391]/30"
          />
        </label>
        {error ? (
          <p role="alert" className="mt-3 text-sm font-medium font-satoshi text-[#C0392B]">
            {error}
          </p>
        ) : null}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-[#E5E5E5] px-5 text-sm font-bold font-satoshi text-[#2F2F2F] transition-colors hover:bg-[#FAFAFA] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#135391] disabled:opacity-60"
          >
            Keep booking
          </button>
          <button
            type="button"
            onClick={() => onConfirm(reason)}
            disabled={pending}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-[#DD2222] px-5 text-sm font-bold font-satoshi text-white transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DD2222] focus-visible:ring-offset-2 disabled:opacity-60"
          >
            {pending ? "Cancelling…" : "Cancel booking"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9E9E9E]">{title}</p>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

function SidebarField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <p className="shrink-0 text-xs font-medium font-satoshi text-[#676565]">{label}</p>
      <p className="min-w-0 break-words text-right text-sm font-semibold font-satoshi text-[#2F2F2F]">
        {value}
      </p>
    </div>
  );
}
