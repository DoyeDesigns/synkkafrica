"use client";

import {
  Banknote,
  Check,
  ChevronDown,
  Copy,
  Download,
  Hourglass,
  Search,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { VENDOR_PAYOUT_BANK_OPTIONS } from "@/features/vendor/data/vendor-business-profile";
import { useTranslation } from "@/hooks/use-translation";
import {
  addAdminPayoutNote,
  approveAdminPayout,
  declineAdminPayout,
  getAdminPayout,
  listAdminPayouts,
  type AdminPayoutCurrencySummary,
  type AdminPayoutDetail,
  type AdminPayoutDisplayStatus,
  type AdminPayoutHistoryEntry,
  type AdminPayoutItem,
} from "@/lib/api/admin/payouts";
import { LIVE_QUERY_OPTIONS } from "@/lib/live-query-options";
import type { TranslationKey } from "@/lib/preferences/translations";

// ---------------------------------------------------------------------------
// Constants & helpers
// ---------------------------------------------------------------------------

const STATUS_LABEL_KEYS: Record<AdminPayoutDisplayStatus, TranslationKey> = {
  pending: "admin.payouts.status.pending",
  completed: "admin.payouts.status.completed",
  declined: "admin.payouts.status.declined",
  failed: "admin.payouts.status.failedTransfer",
};

const STATUS_BADGE_STYLES: Record<AdminPayoutDisplayStatus, string> = {
  pending: "bg-[#FFF3E0] text-[#E65100]",
  completed: "bg-[#E8F5E9] text-[#2E7D32]",
  declined: "bg-[#FDEBEB] text-[#C0392B]",
  failed: "bg-[#E8EAF6] text-[#3949AB]",
};

const FILTER_OPTIONS = ["all", "pending", "completed", "declined", "failed"] as const;
type FilterOption = (typeof FILTER_OPTIONS)[number];

const PERIOD_OPTIONS = ["this-month", "last-month", "this-quarter", "all"] as const;
type PeriodOption = (typeof PERIOD_OPTIONS)[number];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "amount-desc", label: "Amount: high to low" },
  { value: "amount-asc", label: "Amount: low to high" },
  { value: "vendor", label: "Vendor A–Z" },
] as const;
type SortOption = (typeof SORT_OPTIONS)[number]["value"];

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 250;

const FOCUS_RING =
  "outline-none focus-visible:ring-2 focus-visible:ring-[#135391] focus-visible:ring-offset-1";

const BANK_LABEL_BY_ID: Record<string, TranslationKey> = Object.fromEntries(
  VENDOR_PAYOUT_BANK_OPTIONS.map((b) => [b.id, b.labelKey]),
);

function isOneOf<T extends string>(list: readonly T[], v: string | null): v is T {
  return v !== null && (list as readonly string[]).includes(v);
}

function errorMessage(err: unknown, fallback = "Something went wrong. Please try again.") {
  return err instanceof Error && err.message ? err.message : fallback;
}

// Money in the payout's own currency — never converted or mixed.
function formatMoney(currency: string, amount: number): string {
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("en-GB")}`;
  }
}

// dd MMM yyyy, e.g. "05 Oct 2026".
function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatPeriod(start: string | null, end: string): string {
  return start ? `${formatDate(start)} – ${formatDate(end)}` : `Up to ${formatDate(end)}`;
}

function formatCategories(categories: string[]): string {
  if (categories.length === 0) return "No listings";
  return categories.map((c) => c.charAt(0).toUpperCase() + c.slice(1)).join(", ");
}

function maskAccount(accountNumber: string | null): string {
  return accountNumber ? `****${accountNumber.slice(-4)}` : "—";
}

function monthLabel(d: Date) {
  return d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

function periodRange(period: PeriodOption, now = new Date()): { from?: string; to?: string } {
  const y = now.getFullYear();
  const m = now.getMonth();
  switch (period) {
    case "this-month":
      return { from: new Date(y, m, 1).toISOString() };
    case "last-month":
      return {
        from: new Date(y, m - 1, 1).toISOString(),
        to: new Date(y, m, 1, 0, 0, 0, -1).toISOString(),
      };
    case "this-quarter":
      return { from: new Date(y, Math.floor(m / 3) * 3, 1).toISOString() };
    default:
      return {};
  }
}

function periodLabel(period: PeriodOption, now = new Date()): string {
  const y = now.getFullYear();
  const m = now.getMonth();
  switch (period) {
    case "this-month":
      return `This month — ${monthLabel(now)}`;
    case "last-month":
      return `Last month — ${monthLabel(new Date(y, m - 1, 1))}`;
    case "this-quarter":
      return `This quarter — Q${Math.floor(m / 3) + 1} ${y}`;
    default:
      return "All time";
  }
}

function sortPayouts(items: AdminPayoutItem[], sort: SortOption): AdminPayoutItem[] {
  const list = [...items];
  const time = (p: AdminPayoutItem) => new Date(p.requestedAt).getTime();
  switch (sort) {
    case "oldest":
      return list.sort((a, b) => time(a) - time(b));
    case "amount-desc":
      return list.sort((a, b) => b.amount - a.amount);
    case "amount-asc":
      return list.sort((a, b) => a.amount - b.amount);
    case "vendor":
      return list.sort((a, b) => a.vendorName.localeCompare(b.vendorName));
    default:
      return list.sort((a, b) => time(b) - time(a));
  }
}

function csvCell(value: string | number | null | undefined): string {
  const s = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function downloadCsv(rows: AdminPayoutItem[], bankLabel: (id: string | null) => string) {
  const header = [
    "Reference",
    "Vendor",
    "Vendor email",
    "Categories",
    "Status",
    "Amount",
    "Currency",
    "Requested",
    "Period start",
    "Period end",
    "Bank",
    "Account number",
    "Account name",
    "Bookings in period",
    "Gross booking earnings",
    "Platform commission",
  ];
  const lines = rows.map((p) =>
    [
      p.reference,
      p.vendorName,
      p.vendorEmail,
      formatCategories(p.categories),
      p.displayStatus,
      p.amount.toFixed(2),
      p.currency,
      p.requestedAt.slice(0, 10),
      p.periodStart?.slice(0, 10) ?? "",
      p.periodEnd.slice(0, 10),
      bankLabel(p.bankId),
      p.accountNumber,
      p.accountName,
      p.bookingsCount,
      p.grossEarnings.toFixed(2),
      p.commissionAmount.toFixed(2),
    ]
      .map(csvCell)
      .join(","),
  );
  const blob = new Blob([[header.join(","), ...lines].join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `payouts-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Skeleton (also the page's Suspense fallback)
// ---------------------------------------------------------------------------

export function AdminPayoutsSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading payouts">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="h-6 w-32 animate-pulse rounded bg-[#EEEEEE]" />
          <div className="h-4 w-72 animate-pulse rounded bg-[#F3F3F3]" />
        </div>
        <div className="h-11 w-full animate-pulse rounded-lg bg-[#F3F3F3] sm:w-56" />
      </div>
      <StatsSkeleton />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section className="rounded-xl border border-[#EEEEEE] bg-white shadow-sm">
          <div className="space-y-4 border-b border-[#F0F0F0] p-4">
            <div className="h-11 animate-pulse rounded-full bg-[#F3F3F3]" />
            <div className="flex gap-2">
              {FILTER_OPTIONS.map((f) => (
                <div key={f} className="h-7 w-20 animate-pulse rounded-full bg-[#F3F3F3]" />
              ))}
            </div>
          </div>
          <ListSkeleton />
        </section>
        <DetailSkeleton />
      </div>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="rounded-xl border border-[#EEEEEE] bg-white px-5 py-4 shadow-sm">
          <div className="h-6 w-28 animate-pulse rounded bg-[#EEEEEE]" />
          <div className="mt-2 h-3 w-24 animate-pulse rounded bg-[#F3F3F3]" />
          <div className="mt-1.5 h-3 w-32 animate-pulse rounded bg-[#F3F3F3]" />
        </div>
      ))}
    </div>
  );
}

function ListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <ul className="divide-y divide-[#F0F0F0]">
      {Array.from({ length: rows }, (_, i) => (
        <li key={i} className="flex items-start justify-between gap-4 px-5 py-4">
          <div className="space-y-2">
            <div className="h-4 w-40 animate-pulse rounded bg-[#EEEEEE]" />
            <div className="h-3 w-64 animate-pulse rounded bg-[#F3F3F3]" />
            <div className="h-3 w-48 animate-pulse rounded bg-[#F3F3F3]" />
          </div>
          <div className="space-y-2">
            <div className="ml-auto h-4 w-24 animate-pulse rounded bg-[#EEEEEE]" />
            <div className="ml-auto h-6 w-20 animate-pulse rounded-full bg-[#F3F3F3]" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function DetailSkeleton() {
  return (
    <section
      className="rounded-xl border border-[#EEEEEE] bg-white shadow-sm"
      aria-busy="true"
      aria-label="Loading payout"
    >
      <div className="space-y-2 border-b border-[#F0F0F0] p-5">
        <div className="h-5 w-64 animate-pulse rounded bg-[#EEEEEE]" />
        <div className="h-4 w-80 animate-pulse rounded bg-[#F3F3F3]" />
      </div>
      <div className="space-y-6 p-5">
        <div className="h-40 animate-pulse rounded-lg bg-[#FAFAFA]" />
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-4 w-full animate-pulse rounded bg-[#F3F3F3]" />
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

type DialogState = { kind: "approve" | "decline"; payout: AdminPayoutItem } | null;

export function AdminPayoutsLiveContent() {
  const t = useTranslation();
  const { data: session } = useSession();
  const token = session?.accessToken;
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL-backed view state (survives refresh / back).
  const q = searchParams.get("q") ?? "";
  const statusParam = searchParams.get("status");
  const filter: FilterOption = isOneOf(FILTER_OPTIONS, statusParam) ? statusParam : "all";
  const periodParam = searchParams.get("period");
  const period: PeriodOption = isOneOf(PERIOD_OPTIONS, periodParam) ? periodParam : "all";
  const sortParam = searchParams.get("sort");
  const sort: SortOption = isOneOf(
    SORT_OPTIONS.map((s) => s.value),
    sortParam,
  )
    ? (sortParam as SortOption)
    : "newest";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const selectedParam = searchParams.get("id");
  const currencyParam = searchParams.get("currency");

  const setParams = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  // Debounced search box → `q`.
  const [searchInput, setSearchInput] = useState(q);
  const lastPushed = useRef(q);
  useEffect(() => {
    if (searchInput === lastPushed.current) return;
    const id = window.setTimeout(() => {
      lastPushed.current = searchInput;
      setParams({ q: searchInput.trim() || null, page: null });
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setParams reads latest params
  }, [searchInput]);
  // Follow back/forward navigation.
  useEffect(() => {
    if (q !== lastPushed.current) {
      lastPushed.current = q;
      setSearchInput(q);
    }
  }, [q]);

  const range = useMemo(() => periodRange(period), [period]);

  const listQuery = useQuery({
    queryKey: ["admin-payouts", "list", period],
    queryFn: () => listAdminPayouts(token as string, range),
    enabled: Boolean(token),
    ...LIVE_QUERY_OPTIONS,
  });

  const items = useMemo(() => listQuery.data?.items ?? [], [listQuery.data]);
  const summaries = useMemo(() => listQuery.data?.summaries ?? [], [listQuery.data]);
  const summary: AdminPayoutCurrencySummary | undefined =
    summaries.find((s) => s.currency === currencyParam) ?? summaries[0];

  const counts = useMemo(() => {
    const c: Record<FilterOption, number> = {
      all: items.length,
      pending: 0,
      completed: 0,
      declined: 0,
      failed: 0,
    };
    for (const p of items) c[p.displayStatus] += 1;
    return c;
  }, [items]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return sortPayouts(
      items.filter(
        (p) =>
          (filter === "all" || p.displayStatus === filter) &&
          (!needle ||
            p.vendorName.toLowerCase().includes(needle) ||
            p.reference.toLowerCase().includes(needle) ||
            (p.vendorEmail ?? "").toLowerCase().includes(needle)),
      ),
      sort,
    );
  }, [filter, items, q, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const selected =
    items.find((p) => p.id === selectedParam) ?? pageItems[0] ?? undefined;

  const detailQuery = useQuery({
    queryKey: ["admin-payouts", "detail", selected?.id],
    queryFn: () => getAdminPayout(token as string, selected!.id),
    enabled: Boolean(token && selected),
    ...LIVE_QUERY_OPTIONS,
  });

  const bankLabel = (id: string | null) => {
    if (!id) return "Not set";
    const key = BANK_LABEL_BY_ID[id];
    return key ? t(key) : id;
  };

  // Success feedback banner.
  const [flash, setFlash] = useState<string | null>(null);
  useEffect(() => {
    if (!flash) return;
    const id = window.setTimeout(() => setFlash(null), 5000);
    return () => window.clearTimeout(id);
  }, [flash]);

  const [dialog, setDialog] = useState<DialogState>(null);

  const afterMutation = async (detail: AdminPayoutDetail) => {
    queryClient.setQueryData(["admin-payouts", "detail", detail.id], detail);
    await queryClient.invalidateQueries({ queryKey: ["admin-payouts"] });
  };

  const approveMutation = useMutation({
    mutationFn: (p: AdminPayoutItem) => approveAdminPayout(token as string, p.id),
    onSuccess: async (detail, p) => {
      await afterMutation(detail);
      setDialog(null);
      setFlash(`${p.reference} for ${p.vendorName} marked as paid.`);
    },
  });
  const declineMutation = useMutation({
    mutationFn: (v: { payout: AdminPayoutItem; reason: string }) =>
      declineAdminPayout(token as string, v.payout.id, v.reason.trim() || undefined),
    onSuccess: async (detail, v) => {
      await afterMutation(detail);
      setDialog(null);
      setFlash(
        `${v.payout.reference} for ${v.payout.vendorName} declined. The funds are back in the vendor's balance.`,
      );
    },
  });
  const noteMutation = useMutation({
    mutationFn: (v: { id: string; note: string }) =>
      addAdminPayoutNote(token as string, v.id, v.note),
    onSuccess: afterMutation,
  });

  const openDialog = (next: DialogState) => {
    approveMutation.reset();
    declineMutation.reset();
    setDialog(next);
  };

  const detailRef = useRef<HTMLDivElement>(null);
  const selectPayout = (id: string) => {
    setParams({ id });
    if (typeof window !== "undefined" && window.innerWidth < 1280) {
      window.requestAnimationFrame(() =>
        detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    }
  };

  const hasFilters = Boolean(q) || filter !== "all";
  const clearFilters = () => {
    setSearchInput("");
    lastPushed.current = "";
    setParams({ q: null, status: null, page: null });
  };

  if (!listQuery.data && !listQuery.error) return <AdminPayoutsSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-bold font-satoshi text-[#2F2F2F]">
            {t("admin.payouts.title")}
          </h2>
          <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
            {t("admin.payouts.subtitle")}
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          {summaries.length > 1 ? (
            <SelectBox
              label="Currency"
              value={summary?.currency ?? ""}
              onChange={(v) => setParams({ currency: v })}
              options={summaries.map((s) => ({ value: s.currency, label: `Totals in ${s.currency}` }))}
              className="sm:w-44"
            />
          ) : null}
          <SelectBox
            label="Period"
            value={period}
            onChange={(v) => setParams({ period: v === "all" ? null : v, page: null, id: null })}
            options={PERIOD_OPTIONS.map((p) => ({ value: p, label: periodLabel(p) }))}
            className="sm:w-56"
          />
          <button
            type="button"
            onClick={() => downloadCsv(filtered, bankLabel)}
            disabled={filtered.length === 0}
            className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#E5E5E5] bg-white px-4 text-sm font-bold font-satoshi text-[#2F2F2F] transition-colors hover:bg-[#FAFAFA] disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS_RING}`}
          >
            <Download className="h-4 w-4" aria-hidden />
            Export CSV
          </button>
        </div>
      </div>

      {flash ? (
        <div
          role="status"
          className="flex items-start justify-between gap-3 rounded-lg border border-[#C8E6C9] bg-[#E8F5E9] px-4 py-3 text-sm font-medium font-satoshi text-[#2E7D32]"
        >
          <span>{flash}</span>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setFlash(null)}
            className={`rounded ${FOCUS_RING}`}
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ) : null}

      {listQuery.error ? (
        <ErrorBanner
          message={errorMessage(listQuery.error, "Couldn't load payouts.")}
          onRetry={() => void listQuery.refetch()}
          retrying={listQuery.isFetching}
        />
      ) : null}

      {summary ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryStatCard
            label={t("admin.payouts.stats.totalPeriod")}
            value={formatMoney(summary.currency, summary.total)}
            subtitle={t("admin.payouts.stats.totalVendors", { count: summary.vendorCount })}
            valueClassName="text-[#135391]"
            icon={Banknote}
          />
          <SummaryStatCard
            label={t("admin.payouts.stats.pending")}
            value={formatMoney(summary.currency, summary.pending)}
            subtitle={t("admin.payouts.stats.pendingSubtitle", { count: summary.pendingCount })}
            valueClassName="text-[#D85A30]"
            icon={Hourglass}
          />
          <SummaryStatCard
            label={t("admin.payouts.stats.completed")}
            value={formatMoney(summary.currency, summary.completed)}
            subtitle={t("admin.payouts.stats.completedSubtitle", {
              count: summary.completedCount,
            })}
            valueClassName="text-[#2E7D32]"
            icon={Check}
          />
          <SummaryStatCard
            label={t("admin.payouts.stats.declinedFailed")}
            value={formatMoney(summary.currency, summary.declined + summary.failed)}
            subtitle={t("admin.payouts.stats.declinedFailedSubtitle", {
              declined: summary.declinedCount,
              failed: summary.failedCount,
            })}
            valueClassName="text-[#DD2222]"
            icon={X}
          />
        </div>
      ) : listQuery.data ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {(
            [
              ["admin.payouts.stats.totalPeriod", Banknote],
              ["admin.payouts.stats.pending", Hourglass],
              ["admin.payouts.stats.completed", Check],
              ["admin.payouts.stats.declinedFailed", X],
            ] as const
          ).map(([key, icon]) => (
            <SummaryStatCard
              key={key}
              label={t(key)}
              value="—"
              subtitle={`No payouts · ${periodLabel(period)}`}
              valueClassName="text-[#9E9E9E]"
              icon={icon}
            />
          ))}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section className="rounded-xl border border-[#EEEEEE] bg-white shadow-sm">
          <div className="sticky top-0 z-10 space-y-4 rounded-t-xl border-b border-[#F0F0F0] bg-white p-4">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]"
                aria-hidden
              />
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder={t("admin.payouts.searchPlaceholder")}
                aria-label="Search payouts by vendor name or reference"
                className="h-11 w-full rounded-full border border-[#E5E5E5] bg-white pl-11 pr-4 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none focus:border-[#135391] focus-visible:ring-2 focus-visible:ring-[#135391]/30"
              />
            </div>

            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
              {FILTER_OPTIONS.map((status) => (
                <button
                  key={status}
                  type="button"
                  aria-pressed={filter === status}
                  onClick={() =>
                    setParams({ status: status === "all" ? null : status, page: null })
                  }
                  className={`rounded-full px-3 py-1.5 text-xs font-bold font-satoshi transition-colors ${FOCUS_RING} ${
                    filter === status
                      ? "bg-[#135391] text-white"
                      : "border border-[#E5E5E5] bg-white text-[#676565] hover:bg-[#FAFAFA]"
                  }`}
                >
                  {t(`admin.payouts.filter.${status}` as TranslationKey, {
                    count: counts[status],
                  })}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-medium font-satoshi text-[#676565]" aria-live="polite">
                {filtered.length} {filtered.length === 1 ? "payout" : "payouts"}
                {hasFilters ? " match" : ""} · {periodLabel(period)}
              </p>
              <label className="flex items-center gap-2 text-xs font-medium font-satoshi text-[#676565]">
                Sort
                <span className="relative">
                  <select
                    value={sort}
                    onChange={(e) =>
                      setParams({ sort: e.target.value === "newest" ? null : e.target.value })
                    }
                    className="h-8 appearance-none rounded-lg border border-[#E5E5E5] bg-white pl-3 pr-8 text-xs font-semibold text-[#2F2F2F] outline-none focus:border-[#135391] focus-visible:ring-2 focus-visible:ring-[#135391]/30"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
                    aria-hidden
                  />
                </span>
              </label>
            </div>
          </div>

          <ul className="max-h-[640px] divide-y divide-[#F0F0F0] overflow-y-auto">
            {pageItems.length > 0 ? (
              pageItems.map((payout) => (
                <PayoutListItem
                  key={payout.id}
                  payout={payout}
                  isSelected={selected?.id === payout.id}
                  bankLabel={bankLabel(payout.bankId)}
                  onSelect={() => selectPayout(payout.id)}
                />
              ))
            ) : (
              <li className="px-5 py-10 text-center">
                <p className="text-sm font-medium font-satoshi text-[#676565]">
                  {hasFilters
                    ? t("admin.payouts.empty")
                    : `No payout requests · ${periodLabel(period)}.`}
                </p>
                {hasFilters ? (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className={`mt-3 rounded-lg border border-[#E5E5E5] px-4 py-2 text-xs font-bold font-satoshi text-[#135391] hover:bg-[#FAFAFA] ${FOCUS_RING}`}
                  >
                    Clear search and filters
                  </button>
                ) : period !== "all" ? (
                  <button
                    type="button"
                    onClick={() => setParams({ period: null, page: null, id: null })}
                    className={`mt-3 rounded-lg border border-[#E5E5E5] px-4 py-2 text-xs font-bold font-satoshi text-[#135391] hover:bg-[#FAFAFA] ${FOCUS_RING}`}
                  >
                    Show all time
                  </button>
                ) : (
                  <p className="mt-1 text-xs font-medium font-satoshi text-[#9E9E9E]">
                    Vendor withdrawal requests will appear here.
                  </p>
                )}
              </li>
            )}
          </ul>

          {filtered.length > PAGE_SIZE ? (
            <nav
              aria-label="Payout pages"
              className="flex items-center justify-between gap-3 border-t border-[#F0F0F0] px-5 py-3 text-xs font-medium font-satoshi text-[#676565]"
            >
              <span>
                {(currentPage - 1) * PAGE_SIZE + 1}–
                {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setParams({ page: String(currentPage - 1), id: null })}
                  className={`rounded-lg border border-[#E5E5E5] px-3 py-1.5 font-bold text-[#2F2F2F] hover:bg-[#FAFAFA] disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS_RING}`}
                >
                  Previous
                </button>
                <span>
                  Page {currentPage} of {pageCount}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= pageCount}
                  onClick={() => setParams({ page: String(currentPage + 1), id: null })}
                  className={`rounded-lg border border-[#E5E5E5] px-3 py-1.5 font-bold text-[#2F2F2F] hover:bg-[#FAFAFA] disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS_RING}`}
                >
                  Next
                </button>
              </div>
            </nav>
          ) : null}
        </section>

        <div ref={detailRef} className="scroll-mt-4">
          {selected ? (
            detailQuery.data && detailQuery.data.id === selected.id ? (
              <PayoutDetailPanel
                payout={detailQuery.data}
                bankLabel={bankLabel(detailQuery.data.bankId)}
                busy={approveMutation.isPending || declineMutation.isPending}
                onMarkComplete={() => openDialog({ kind: "approve", payout: selected })}
                onDecline={() => openDialog({ kind: "decline", payout: selected })}
                onAddNote={(note) => noteMutation.mutateAsync({ id: selected.id, note })}
                notePending={noteMutation.isPending}
                noteError={noteMutation.error ? errorMessage(noteMutation.error) : null}
              />
            ) : detailQuery.error ? (
              <section className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm">
                <ErrorBanner
                  message={errorMessage(detailQuery.error, "Couldn't load this payout.")}
                  onRetry={() => void detailQuery.refetch()}
                  retrying={detailQuery.isFetching}
                />
              </section>
            ) : (
              <DetailSkeleton />
            )
          ) : items.length > 0 ? (
            <section className="rounded-xl border border-dashed border-[#E0E0E0] bg-white px-5 py-16 text-center text-sm font-medium font-satoshi text-[#676565]">
              Select a payout to see its details.
            </section>
          ) : null}
        </div>
      </div>

      {dialog ? (
        <ConfirmDialog
          dialog={dialog}
          pending={
            dialog.kind === "approve" ? approveMutation.isPending : declineMutation.isPending
          }
          error={
            dialog.kind === "approve"
              ? approveMutation.error
                ? errorMessage(approveMutation.error)
                : null
              : declineMutation.error
                ? errorMessage(declineMutation.error)
                : null
          }
          onCancel={() => setDialog(null)}
          onConfirm={(reason) => {
            if (dialog.kind === "approve") approveMutation.mutate(dialog.payout);
            else declineMutation.mutate({ payout: dialog.payout, reason });
          }}
        />
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pieces
// ---------------------------------------------------------------------------

function SelectBox({
  label,
  value,
  onChange,
  options,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  className?: string;
}) {
  return (
    <div className={`relative w-full ${className}`}>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full appearance-none rounded-lg border border-[#E5E5E5] bg-white pl-4 pr-10 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none focus:border-[#135391] focus-visible:ring-2 focus-visible:ring-[#135391]/30"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]"
        aria-hidden
      />
    </div>
  );
}

function ErrorBanner({
  message,
  onRetry,
  retrying,
}: {
  message: string;
  onRetry: () => void;
  retrying: boolean;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-lg border border-[#F5C6C6] bg-[#FDEBEB] px-4 py-3 text-sm font-medium font-satoshi text-[#C0392B] sm:flex-row sm:items-center sm:justify-between"
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={onRetry}
        disabled={retrying}
        className={`shrink-0 rounded-lg border border-[#C0392B] bg-white px-3 py-1.5 text-xs font-bold text-[#C0392B] hover:bg-[#FFF5F5] disabled:opacity-60 ${FOCUS_RING}`}
      >
        {retrying ? "Retrying…" : "Retry"}
      </button>
    </div>
  );
}

function SummaryStatCard({
  label,
  value,
  subtitle,
  valueClassName,
  icon: Icon,
}: {
  label: string;
  value: string;
  subtitle: string;
  valueClassName: string;
  icon: typeof Banknote;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[#EEEEEE] bg-white px-5 py-4 shadow-sm">
      <Icon className="absolute right-4 top-4 h-8 w-8 text-[#ECEFF1]" strokeWidth={1.5} aria-hidden />
      <p className={`text-xl font-bold font-inter tabular-nums ${valueClassName}`}>{value}</p>
      <p className="mt-1 text-xs font-semibold font-satoshi text-[#676565]">{label}</p>
      <p className="mt-0.5 text-xs font-medium font-satoshi text-[#9E9E9E]">{subtitle}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: AdminPayoutDisplayStatus }) {
  const t = useTranslation();
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${STATUS_BADGE_STYLES[status]}`}
    >
      {t(STATUS_LABEL_KEYS[status])}
    </span>
  );
}

function PayoutListItem({
  payout,
  isSelected,
  bankLabel,
  onSelect,
}: {
  payout: AdminPayoutItem;
  isSelected: boolean;
  bankLabel: string;
  onSelect: () => void;
}) {
  const t = useTranslation();

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-current={isSelected ? "true" : undefined}
        className={`flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-[#FAFAFA] focus-visible:bg-[#F0F6FC] focus-visible:outline-none ${
          isSelected ? "border-l-4 border-[#135391] bg-[#F0F6FC]" : "border-l-4 border-transparent"
        }`}
      >
        <div className="min-w-0">
          <p className="truncate font-bold font-satoshi text-[#2F2F2F]">{payout.vendorName}</p>
          <p className="mt-1 text-xs font-medium font-satoshi text-[#676565]">
            {formatCategories(payout.categories)} &bull; {payout.reference} &bull;{" "}
            {t("admin.payouts.requested", { date: formatDate(payout.requestedAt) })}
          </p>
          <p className="mt-0.5 text-xs font-medium font-satoshi text-[#9E9E9E]">
            {t("admin.payouts.listBookingsBank", {
              count: payout.bookingsCount,
              bank: bankLabel,
              account: maskAccount(payout.accountNumber),
            })}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="font-bold font-satoshi tabular-nums text-[#2F2F2F]">
            {formatMoney(payout.currency, payout.amount)}
          </p>
          <span className="mt-2 inline-flex">
            <StatusBadge status={payout.displayStatus} />
          </span>
        </div>
      </button>
    </li>
  );
}

const HISTORY_LABEL: Record<AdminPayoutHistoryEntry["action"], string> = {
  approved: "Marked as paid",
  declined: "Declined",
  note: "Note",
};

function PayoutDetailPanel({
  payout,
  bankLabel,
  busy,
  onMarkComplete,
  onDecline,
  onAddNote,
  notePending,
  noteError,
}: {
  payout: AdminPayoutDetail;
  bankLabel: string;
  busy: boolean;
  onMarkComplete: () => void;
  onDecline: () => void;
  onAddNote: (note: string) => Promise<unknown>;
  notePending: boolean;
  noteError: string | null;
}) {
  const t = useTranslation();
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);
  const money = (n: number) => formatMoney(payout.currency, n);

  const copyAccount = async () => {
    if (!payout.accountNumber) return;
    try {
      await navigator.clipboard.writeText(payout.accountNumber);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked — the number is visible to copy manually.
    }
  };

  const submitNote = async (event: React.FormEvent) => {
    event.preventDefault();
    const text = note.trim();
    if (!text || notePending) return;
    try {
      await onAddNote(text);
      setNote("");
    } catch {
      // Error shown via noteError.
    }
  };

  const missingBank = !payout.bankId || !payout.accountNumber;

  return (
    <section className="rounded-xl border border-[#EEEEEE] bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#F0F0F0] p-5">
        <div className="min-w-0">
          <h3 className="text-base font-bold font-satoshi text-[#2F2F2F]">
            {payout.vendorName} &mdash; {payout.reference}
          </h3>
          <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
            {formatCategories(payout.categories)} &bull;{" "}
            {t("admin.payouts.requested", { date: formatDate(payout.requestedAt) })} &bull;{" "}
            {t("admin.payouts.periodLabel", {
              period: formatPeriod(payout.periodStart, payout.periodEnd),
            })}
          </p>
        </div>
        <StatusBadge status={payout.displayStatus} />
      </div>

      <div className="space-y-6 p-5">
        <div className="rounded-lg bg-[#FAFAFA] px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#676565]">
            {t("admin.payouts.netPayoutToVendor")}
          </p>
          <p className="mt-2 text-2xl font-bold font-inter tabular-nums text-[#2F2F2F]">
            {money(payout.amount)}
          </p>
          <dl className="mt-4 space-y-2 text-sm font-satoshi">
            <div className="flex justify-between gap-4">
              <dt className="text-[#676565]">{t("admin.payouts.grossEarnings")}</dt>
              <dd className="font-semibold tabular-nums text-[#2F2F2F]">
                {money(payout.grossEarnings)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[#676565]">
                {t("admin.payouts.platformCommission", { rate: payout.commissionRate })}
              </dt>
              <dd className="font-semibold tabular-nums text-[#DD2222]">
                - {money(payout.commissionAmount)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[#676565]">Vendor share credited in period</dt>
              <dd className="font-semibold tabular-nums text-[#2F2F2F]">
                {money(payout.vendorShare)}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-dotted border-[#E0E0E0] pt-2">
              <dt className="font-semibold text-[#2F2F2F]">{t("admin.payouts.netPayout")}</dt>
              <dd className="font-bold tabular-nums text-[#2F2F2F]">{money(payout.amount)}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs font-medium font-satoshi text-[#9E9E9E]">
            Earnings are the bookings credited since the vendor&apos;s previous payout. The
            payout is the amount the vendor requested from their available balance.
          </p>
        </div>

        <DetailSection title={t("admin.payouts.paymentDestination")}>
          {missingBank ? (
            <p className="mb-2 rounded-lg bg-[#FFF3E0] px-3 py-2 text-xs font-semibold font-satoshi text-[#E65100]">
              The vendor hasn&apos;t completed their payout bank details.
            </p>
          ) : null}
          <DetailRow label={t("admin.payouts.bank")} value={bankLabel} />
          <DetailRow
            label={t("admin.payouts.accountNumber")}
            value={
              payout.accountNumber ? (
                <span className="inline-flex items-center gap-2">
                  <span className="tabular-nums">{payout.accountNumber}</span>
                  <button
                    type="button"
                    onClick={() => void copyAccount()}
                    aria-label="Copy account number"
                    className={`rounded p-1 text-[#676565] hover:bg-[#F0F0F0] ${FOCUS_RING}`}
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-[#2E7D32]" aria-hidden />
                    ) : (
                      <Copy className="h-3.5 w-3.5" aria-hidden />
                    )}
                  </button>
                  <span className="sr-only" aria-live="polite">
                    {copied ? "Copied" : ""}
                  </span>
                </span>
              ) : (
                "Not set"
              )
            }
          />
          <DetailRow label={t("admin.payouts.accountName")} value={payout.accountName ?? "Not set"} />
          <DetailRow label={t("admin.payouts.payoutMethod")} value="Bank transfer" />
        </DetailSection>

        <DetailSection
          title={t("admin.payouts.associatedBookings", { count: payout.bookingsCount })}
        >
          {payout.associatedBookings.length > 0 ? (
            <div className="max-h-72 overflow-y-auto">
              {payout.associatedBookings.map((booking) => (
                <DetailRow
                  key={booking.transactionId}
                  label={
                    <span className="flex flex-col">
                      <span className="font-semibold text-[#2F2F2F]">
                        {booking.bookingReference ?? "Booking removed"}
                      </span>
                      <span className="text-xs text-[#9E9E9E]">
                        {booking.listingTitle} · {formatDate(booking.creditedAt)}
                      </span>
                    </span>
                  }
                  value={<span className="tabular-nums">{money(booking.vendorShare)}</span>}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm font-medium font-satoshi text-[#9E9E9E]">
              No bookings were credited in this period.
            </p>
          )}
        </DetailSection>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9E9E9E]">
            {t("admin.payouts.internalNote")}
          </p>
          {payout.history.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {payout.history.map((h) => (
                <li key={h.id} className="rounded-lg bg-[#F0F6FC] px-4 py-3">
                  <p className="text-xs font-bold font-satoshi text-[#135391]">
                    {HISTORY_LABEL[h.action]}
                  </p>
                  {h.note ? (
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-[#2F2F2F]">
                      {h.note}
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs font-medium text-[#676565]">
                    {t("admin.payouts.noteAttribution", {
                      author: h.adminEmail ?? "Admin",
                      date: formatDate(h.occurredAt),
                    })}
                  </p>
                </li>
              ))}
            </ul>
          ) : null}
          <form onSubmit={(e) => void submitNote(e)} className="mt-3 space-y-2">
            <label htmlFor="payout-note" className="sr-only">
              Add an internal note
            </label>
            <textarea
              id="payout-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={1000}
              rows={2}
              placeholder="Add an internal note (only admins can see this)"
              className="w-full rounded-lg border border-[#E5E5E5] px-3 py-2 text-sm font-satoshi text-[#2F2F2F] outline-none focus:border-[#135391] focus-visible:ring-2 focus-visible:ring-[#135391]/30"
            />
            {noteError ? (
              <p role="alert" className="text-xs font-medium text-[#C0392B]">
                {noteError}
              </p>
            ) : null}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!note.trim() || notePending}
                className={`rounded-lg bg-[#135391] px-3 py-2 text-xs font-bold font-satoshi text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS_RING}`}
              >
                {notePending ? "Saving…" : "Add note"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3 border-t border-[#F0F0F0] p-5">
        {payout.status === "pending" ? (
          <button
            type="button"
            onClick={onMarkComplete}
            disabled={busy}
            className={`rounded-lg bg-[#2E7D32] px-4 py-2.5 text-sm font-bold font-satoshi text-white transition-opacity hover:opacity-90 disabled:opacity-60 ${FOCUS_RING}`}
          >
            {t("admin.payouts.markComplete")}
          </button>
        ) : null}
        {payout.vendorEmail ? (
          <a
            href={`mailto:${payout.vendorEmail}?subject=${encodeURIComponent(`Payout ${payout.reference}`)}`}
            className={`rounded-lg border border-[#E5E5E5] bg-white px-4 py-2.5 text-sm font-bold font-satoshi text-[#2F2F2F] transition-colors hover:bg-[#FAFAFA] ${FOCUS_RING}`}
          >
            {t("admin.payouts.contactVendor")}
          </a>
        ) : null}
        {payout.status === "pending" ? (
          <button
            type="button"
            onClick={onDecline}
            disabled={busy}
            className={`rounded-lg border border-[#DD2222] bg-white px-4 py-2.5 text-sm font-bold font-satoshi text-[#DD2222] transition-colors hover:bg-[#FFF5F5] disabled:opacity-60 ${FOCUS_RING}`}
          >
            {t("admin.payouts.decline")}
          </button>
        ) : null}
      </div>
    </section>
  );
}

function ConfirmDialog({
  dialog,
  pending,
  error,
  onCancel,
  onConfirm,
}: {
  dialog: NonNullable<DialogState>;
  pending: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const { payout, kind } = dialog;
  const amount = formatMoney(payout.currency, payout.amount);
  const approve = kind === "approve";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) onCancel();
    };
    document.addEventListener("keydown", onKey);
    panelRef.current?.querySelector<HTMLElement>("textarea, button[data-autofocus]")?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel, pending]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !pending) onCancel();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="payout-dialog-title"
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        <h3 id="payout-dialog-title" className="text-base font-bold font-satoshi text-[#2F2F2F]">
          {approve ? "Mark payout as paid?" : "Decline payout?"}
        </h3>
        <p className="mt-2 text-sm font-medium font-satoshi text-[#676565]">
          {approve ? (
            <>
              Confirm you have sent <strong className="text-[#2F2F2F]">{amount}</strong> to{" "}
              <strong className="text-[#2F2F2F]">{payout.vendorName}</strong> ({payout.reference}).
              The vendor will be notified that the payout was sent.
            </>
          ) : (
            <>
              Decline <strong className="text-[#2F2F2F]">{amount}</strong> for{" "}
              <strong className="text-[#2F2F2F]">{payout.vendorName}</strong> ({payout.reference})?
              The amount goes back to the vendor&apos;s available balance and they will be
              notified.
            </>
          )}
        </p>

        {!approve ? (
          <div className="mt-4">
            <label
              htmlFor="payout-decline-reason"
              className="text-xs font-semibold font-satoshi text-[#2F2F2F]"
            >
              Reason (optional, shown to the vendor)
            </label>
            <textarea
              id="payout-decline-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={500}
              rows={3}
              className="mt-1 w-full rounded-lg border border-[#E5E5E5] px-3 py-2 text-sm font-satoshi outline-none focus:border-[#135391] focus-visible:ring-2 focus-visible:ring-[#135391]/30"
            />
          </div>
        ) : null}

        {error ? (
          <p
            role="alert"
            className="mt-4 rounded-lg bg-[#FDEBEB] px-3 py-2 text-sm font-medium text-[#C0392B]"
          >
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            data-autofocus
            className={`rounded-lg border border-[#E5E5E5] px-4 py-2.5 text-sm font-bold font-satoshi text-[#2F2F2F] hover:bg-[#FAFAFA] disabled:opacity-60 ${FOCUS_RING}`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(reason)}
            disabled={pending}
            className={`rounded-lg px-4 py-2.5 text-sm font-bold font-satoshi text-white disabled:opacity-60 ${FOCUS_RING} ${
              approve ? "bg-[#2E7D32]" : "bg-[#DD2222]"
            }`}
          >
            {pending
              ? approve
                ? "Marking as paid…"
                : "Declining…"
              : approve
                ? `Mark ${amount} as paid`
                : "Decline payout"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9E9E9E]">{title}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-dotted border-[#E0E0E0] py-2.5 last:border-b-0">
      <span className="min-w-0 text-sm font-medium font-satoshi text-[#676565]">{label}</span>
      <span className="shrink-0 text-right text-sm font-semibold font-satoshi text-[#2F2F2F]">
        {value}
      </span>
    </div>
  );
}
