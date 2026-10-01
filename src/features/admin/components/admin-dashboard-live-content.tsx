"use client";

import {
  AlertTriangle,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronDown,
  Plus,
  RotateCw,
  Sparkles,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useRef, useState, type ReactNode } from "react";

import { AdminDashboardBarChart } from "@/features/admin/components/admin-dashboard-bar-chart";
import {
  formatBucketLong,
  formatBucketShort,
  formatCount,
  formatCountFull,
  formatDate,
  formatMoney,
} from "@/features/admin/components/admin-dashboard-format";
import { useClickOutside } from "@/hooks/use-click-outside";
import { useTranslation } from "@/hooks/use-translation";
import {
  ADMIN_DASHBOARD_PERIODS,
  ADMIN_DASHBOARD_RANGES,
  adminGetDashboardAlerts,
  adminGetDashboardKpis,
  adminGetDashboardSeries,
  type AdminDashboardAlerts,
  type AdminDashboardPeriod,
  type AdminDashboardRange,
} from "@/lib/api/admin/dashboard";
import { LIVE_QUERY_OPTIONS } from "@/lib/live-query-options";
import type { TranslationKey } from "@/lib/preferences/translations";

const PERIOD_LABEL_KEYS: Record<AdminDashboardPeriod, TranslationKey> = {
  today: "admin.dashboard.period.today",
  week: "admin.dashboard.period.week",
  month: "admin.dashboard.period.month",
  sixMonths: "admin.dashboard.period.sixMonths",
  year: "admin.dashboard.period.year",
  all: "admin.dashboard.period.all",
};

const RANGE_LABELS: Record<AdminDashboardRange, string> = {
  "7d": "7 days",
  "30d": "30 days",
  "90d": "90 days",
  "12m": "12 months",
};

const ALERT_STYLES = {
  info: "border-[#E3F2FD] bg-[#F0F6FC] text-[#1565C0]",
  warning: "border-[#FFF3E0] bg-[#FFF9F0] text-[#E65100]",
  critical: "border-[#FDEBEB] bg-[#FFF5F5] text-[#C0392B]",
};

function errorMessage(err: unknown) {
  return err instanceof Error && err.message
    ? err.message
    : "Something went wrong. Please try again.";
}

export function AdminDashboardLiveContent({
  adminName,
}: {
  adminName?: string | null;
}) {
  const t = useTranslation();
  const displayName = adminName?.trim() || "SynkAfrica Admin";

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-medium font-satoshi text-[#2F2F2F]">
          {t("admin.dashboard.welcome")}{" "}
          <span className="font-bold text-[#D85A30]">{displayName}</span>
        </h2>

        <Link
          href="/admin/packages?new=1"
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#D85A30] px-5 text-sm font-bold font-satoshi text-white transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          {t("admin.dashboard.addPackages")}
        </Link>
      </div>

      <KpiSection />
      <AlertsSection />
      <TrendsSection />
    </>
  );
}

// ---------------------------------------------------------------------------
// Shared bits
// ---------------------------------------------------------------------------

function useToken() {
  const { data: session } = useSession();
  return session?.accessToken;
}

function WidgetError({
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
      className="flex flex-col gap-3 rounded-lg border border-[#FDEBEB] bg-[#FFF5F5] px-4 py-3 text-sm font-medium font-satoshi text-[#C0392B] sm:flex-row sm:items-center sm:justify-between"
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={onRetry}
        disabled={retrying}
        className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-[#C0392B]/30 bg-white px-3 text-sm font-semibold text-[#C0392B] transition-colors hover:bg-[#FFF0F0] disabled:opacity-60"
      >
        <RotateCw
          className={`h-4 w-4 ${retrying ? "animate-spin" : ""}`}
          aria-hidden
        />
        Retry
      </button>
    </div>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-md bg-[#F0F0F0] ${className}`}
    />
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  href,
  linkLabel,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Icon
          className="mt-0.5 h-5 w-5 shrink-0 text-[#676565]"
          strokeWidth={1.75}
          aria-hidden
        />
        <p className="font-bold font-satoshi text-[#3C3C3C]">{label}</p>
      </div>
      <div className="mt-2 min-w-0 break-words text-3xl font-bold font-inter text-[#D85A30]">
        {value}
      </div>
      {sub ? (
        <div className="mt-1 text-xs font-medium font-satoshi text-[#676565]">
          {sub}
        </div>
      ) : null}
      {href && linkLabel ? (
        <div className="mt-auto flex justify-end pt-2">
          <Link
            href={href}
            className="inline-block text-sm font-medium font-satoshi text-[#135391] underline underline-offset-2"
          >
            {linkLabel}
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm">
      <Skeleton className="h-5 w-28" />
      <Skeleton className="mt-3 h-9 w-32" />
      <Skeleton className="mt-2 h-3 w-24" />
      <div className="mt-3 flex justify-end">
        <Skeleton className="h-4 w-14" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// KPI cards (period-scoped) — the mock's period dropdown + 4 cards
// ---------------------------------------------------------------------------

function KpiSection() {
  const t = useTranslation();
  const token = useToken();
  const [period, setPeriod] = useState<AdminDashboardPeriod>("today");
  const [periodOpen, setPeriodOpen] = useState(false);
  const periodDropdownRef = useRef<HTMLDivElement>(null);
  useClickOutside(periodDropdownRef, () => setPeriodOpen(false), periodOpen);

  const query = useQuery({
    queryKey: ["admin-dashboard-kpis", period],
    queryFn: () => adminGetDashboardKpis(token as string, period),
    enabled: Boolean(token),
    placeholderData: (prev) => prev,
    ...LIVE_QUERY_OPTIONS,
  });
  const data = query.data;
  const periodLabel = t(PERIOD_LABEL_KEYS[period]);
  const sinceLabel = data?.from ? `Since ${formatDate(data.from)}` : "All time";

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <div ref={periodDropdownRef} className="relative w-full sm:max-w-xs">
          <button
            type="button"
            aria-label={t("admin.dashboard.period.label")}
            aria-expanded={periodOpen}
            aria-haspopup="listbox"
            onClick={() => setPeriodOpen((open) => !open)}
            className="flex h-11 w-full items-center justify-between rounded-full border border-[#E5E5E5] bg-white px-4 text-sm font-semibold font-satoshi text-[#2F2F2F] outline-none transition-colors hover:border-[#D85A30] focus:border-[#D85A30]"
          >
            <span>{periodLabel}</span>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-[#676565] transition-transform ${periodOpen ? "rotate-180" : ""}`}
            />
          </button>

          {periodOpen ? (
            <ul
              role="listbox"
              aria-label={t("admin.dashboard.period.label")}
              className="absolute left-0 top-[calc(100%+0.5rem)] z-50 w-full overflow-hidden rounded-xl border border-[#E5E5E5] bg-white py-1 shadow-lg"
            >
              {ADMIN_DASHBOARD_PERIODS.map((option) => {
                const isSelected = option === period;
                return (
                  <li key={option} role="presentation" className="w-full">
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        setPeriod(option);
                        setPeriodOpen(false);
                      }}
                      className={`block w-full px-4 py-2.5 text-left text-sm font-semibold font-satoshi transition-colors ${
                        isSelected
                          ? "bg-[#FFF1EB] text-[#D85A30]"
                          : "text-[#2F2F2F] hover:bg-[#FAFAFA]"
                      }`}
                    >
                      {t(PERIOD_LABEL_KEYS[option])}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
        {data ? (
          <p className="text-xs font-medium font-satoshi text-[#676565]">
            {sinceLabel} · UTC
            {query.isFetching && !query.isLoading ? " · Updating…" : ""}
          </p>
        ) : null}
      </div>

      {query.isError && !data ? (
        <WidgetError
          message={`Couldn't load the headline numbers. ${errorMessage(query.error)}`}
          onRetry={() => void query.refetch()}
          retrying={query.isFetching}
        />
      ) : null}

      {!data ? (
        query.isError ? null : (
          <div
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
            aria-busy="true"
            aria-label="Loading headline numbers"
          >
            {Array.from({ length: 4 }, (_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        )
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Users}
            label={t("admin.dashboard.users")}
            value={
              <span title={formatCountFull(data.users.newInPeriod)}>
                {formatCount(data.users.newInPeriod)}
              </span>
            }
            sub={
              period === "all"
                ? "Registered customers"
                : `New sign-ups · ${formatCount(data.users.total)} total`
            }
            href="/admin/users"
            linkLabel={t("admin.dashboard.viewAll")}
          />
          <StatCard
            icon={Wallet}
            label={t("admin.dashboard.revenue")}
            value={
              data.revenue.length === 0 ? (
                formatMoney("NGN", 0)
              ) : (
                <span
                  title={formatMoney(
                    data.revenue[0].currency,
                    data.revenue[0].total,
                  )}
                >
                  {formatMoney(
                    data.revenue[0].currency,
                    data.revenue[0].total,
                    {
                      compact: data.revenue[0].total >= 1_000_000,
                    },
                  )}
                </span>
              )
            }
            sub={
              <>
                {data.revenue.slice(1).map((r) => (
                  <span
                    key={r.currency}
                    className="mr-2 inline-block font-semibold text-[#3C3C3C]"
                    title={formatMoney(r.currency, r.total)}
                  >
                    +{" "}
                    {formatMoney(r.currency, r.total, {
                      compact: r.total >= 1_000_000,
                    })}
                  </span>
                ))}
                <span className="block">
                  From {formatCountFull(data.bookings.total)} paid{" "}
                  {data.bookings.total === 1 ? "booking" : "bookings"}
                  {data.bookings.flights > 0
                    ? ` (${formatCountFull(data.bookings.flights)} flights)`
                    : ""}
                </span>
              </>
            }
            href="/admin/bookings"
            linkLabel={t("admin.dashboard.viewAll")}
          />
          <StatCard
            icon={Sparkles}
            label={t("admin.dashboard.activeExperiences")}
            value={formatCount(data.activeExperiences)}
            sub="Live right now"
            href="/admin/experiences"
            linkLabel={t("admin.dashboard.manage")}
          />
          <StatCard
            icon={Building2}
            label={t("admin.dashboard.activeVendors")}
            value={formatCount(data.activeVendors)}
            sub="Approved and active"
            href="/admin/vendors"
            linkLabel={t("admin.dashboard.manage")}
          />
        </div>
      )}

      {query.isError && data ? (
        <WidgetError
          message={`Showing the last loaded numbers — refresh failed. ${errorMessage(query.error)}`}
          onRetry={() => void query.refetch()}
          retrying={query.isFetching}
        />
      ) : null}
    </>
  );
}

// ---------------------------------------------------------------------------
// Alerts — admin work queues, highlighted when they need attention
// ---------------------------------------------------------------------------

type Severity = keyof typeof ALERT_STYLES;

type QueueTile = {
  id: string;
  label: string;
  count: number;
  href: string;
  severity: Severity;
};

function queueTiles(a: AdminDashboardAlerts): QueueTile[] {
  return [
    {
      id: "pendingVendors",
      label: "Vendors awaiting approval",
      count: a.pendingVendors,
      href: "/admin/vendors?status=pending",
      severity: "warning",
    },
    {
      id: "pendingDocuments",
      label: "KYC documents to verify",
      count: a.pendingDocuments,
      href: "/admin/verifications",
      severity: "warning",
    },
    {
      id: "pendingAccommodations",
      label: "Accommodations awaiting approval",
      count: a.pendingListings.accommodations,
      href: "/admin/accommodations?status=pending",
      severity: "warning",
    },
    {
      id: "pendingCars",
      label: "Car listings awaiting approval",
      count: a.pendingListings.cars,
      href: "/admin/cars?status=pending",
      severity: "warning",
    },
    {
      id: "pendingExperiences",
      label: "Experiences awaiting approval",
      count: a.pendingListings.experiences,
      href: "/admin/experiences?status=pending",
      severity: "warning",
    },
    {
      id: "pendingPayouts",
      label: "Vendor payouts awaiting approval",
      count: a.pendingPayouts,
      href: "/admin/payouts?status=pending",
      severity: "warning",
    },
    {
      id: "openSupportTickets",
      label: "Open support tickets",
      count: a.openSupportTickets,
      href: "/admin/support?status=open",
      severity: "info",
    },
    {
      id: "awaitingBookings",
      label: "Bookings awaiting vendor confirmation",
      count: a.awaitingBookings,
      href: "/admin/bookings?status=awaiting_confirmation",
      severity: "info",
    },
    {
      id: "suspendedVendors",
      label: "Suspended vendor accounts",
      count: a.suspendedVendors,
      href: "/admin/vendors?status=suspended",
      severity: "critical",
    },
  ];
}

function AlertsSection() {
  const t = useTranslation();
  const token = useToken();
  const query = useQuery({
    queryKey: ["admin-dashboard-alerts"],
    queryFn: () => adminGetDashboardAlerts(token as string),
    enabled: Boolean(token),
    ...LIVE_QUERY_OPTIONS,
  });

  const tiles = query.data ? queueTiles(query.data) : [];
  const open = tiles.filter((x) => x.count > 0);

  return (
    <section
      className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm"
      aria-labelledby="admin-dashboard-alerts-title"
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-[#E65100]" aria-hidden />
        <h3
          id="admin-dashboard-alerts-title"
          className="text-base font-bold font-satoshi text-[#2F2F2F]"
        >
          {t("admin.dashboard.alerts")}
        </h3>
        {query.data && open.length > 0 ? (
          <span className="rounded-full bg-[#FFF1EB] px-2.5 py-0.5 text-xs font-bold font-satoshi text-[#D85A30]">
            {open.length} need{open.length === 1 ? "s" : ""} attention
          </span>
        ) : null}
      </div>

      {query.isError && !query.data ? (
        <WidgetError
          message={`Couldn't load alerts. ${errorMessage(query.error)}`}
          onRetry={() => void query.refetch()}
          retrying={query.isFetching}
        />
      ) : !query.data ? (
        <div aria-busy="true" aria-label="Loading alerts" className="space-y-2">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-11 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          {open.length === 0 ? (
            <p className="flex items-center gap-2 rounded-lg border border-[#E6F4EA] bg-[#F3FBF5] px-4 py-3 text-sm font-medium font-satoshi text-[#1E7B3A]">
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
              All caught up — nothing is waiting on an admin.
            </p>
          ) : (
            <ul className="space-y-2">
              {open.map((alert) => (
                <li key={alert.id}>
                  <Link
                    href={alert.href}
                    className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm font-medium font-satoshi transition-opacity hover:opacity-90 ${ALERT_STYLES[alert.severity]}`}
                  >
                    <span className="underline underline-offset-2">
                      {formatCountFull(alert.count)} {alert.label.toLowerCase()}
                    </span>
                    <span
                      className="shrink-0 rounded-full bg-white/80 px-2 py-0.5 text-xs font-bold"
                      aria-hidden
                    >
                      {formatCount(alert.count)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {/* Every queue, including the empty ones, as quick links. */}
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {tiles.map((tile) => {
              const hot = tile.count > 0;
              return (
                <Link
                  key={tile.id}
                  href={tile.href}
                  className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm font-satoshi transition-colors ${
                    hot
                      ? "border-[#D85A30]/40 bg-[#FFF9F6] hover:border-[#D85A30]"
                      : "border-[#EEEEEE] hover:border-[#D85A30]"
                  }`}
                >
                  <span className="min-w-0 font-medium text-[#3C3C3C]">
                    {tile.label}
                    {hot ? (
                      <span className="sr-only"> — needs attention</span>
                    ) : null}
                  </span>
                  <span
                    className={`shrink-0 text-base font-bold font-inter ${
                      hot ? "text-[#D85A30]" : "text-[#9A9A9A]"
                    }`}
                  >
                    {formatCount(tile.count)}
                  </span>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Trends — paid revenue (one currency at a time) + bookings over time
// ---------------------------------------------------------------------------

function TrendsSection() {
  const token = useToken();
  const [range, setRange] = useState<AdminDashboardRange>("30d");
  const [currencyChoice, setCurrencyChoice] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["admin-dashboard-series", range],
    queryFn: () => adminGetDashboardSeries(token as string, range),
    enabled: Boolean(token),
    placeholderData: (prev) => prev,
    ...LIVE_QUERY_OPTIONS,
  });
  const data = query.data;

  // Currencies present in the window, largest total first.
  const currencies = useMemo(() => {
    const totals = new Map<string, number>();
    for (const p of data?.points ?? [])
      for (const r of p.revenue)
        totals.set(r.currency, (totals.get(r.currency) ?? 0) + r.amount);
    return [...totals.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c);
  }, [data]);
  const currency =
    currencyChoice && currencies.includes(currencyChoice)
      ? currencyChoice
      : (currencies[0] ?? "NGN");

  const revenueData = useMemo(
    () =>
      (data?.points ?? []).map((p) => ({
        key: p.bucket,
        label: formatBucketShort(p.bucket, data!.unit),
        longLabel: formatBucketLong(p.bucket, data!.unit),
        value: p.revenue.find((r) => r.currency === currency)?.amount ?? 0,
      })),
    [data, currency],
  );
  const bookingsData = useMemo(
    () =>
      (data?.points ?? []).map((p) => ({
        key: p.bucket,
        label: formatBucketShort(p.bucket, data!.unit),
        longLabel: formatBucketLong(p.bucket, data!.unit),
        value: p.bookings,
      })),
    [data],
  );

  return (
    <section
      className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm"
      aria-labelledby="admin-dashboard-trends-title"
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-[#676565]" aria-hidden />
          <h3
            id="admin-dashboard-trends-title"
            className="text-base font-bold font-satoshi text-[#2F2F2F]"
          >
            Revenue & bookings
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {currencies.length > 1 ? (
            <div
              role="radiogroup"
              aria-label="Revenue currency"
              className="inline-flex rounded-full border border-[#E5E5E5] p-0.5"
            >
              {currencies.map((c) => (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={c === currency}
                  onClick={() => setCurrencyChoice(c)}
                  className={`h-8 rounded-full px-3 text-xs font-bold font-satoshi transition-colors ${
                    c === currency
                      ? "bg-[#2F2F2F] text-white"
                      : "text-[#676565] hover:text-[#2F2F2F]"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          ) : null}
          <div
            role="radiogroup"
            aria-label="Chart date range"
            className="inline-flex rounded-full border border-[#E5E5E5] p-0.5"
          >
            {ADMIN_DASHBOARD_RANGES.map((r) => (
              <button
                key={r}
                type="button"
                role="radio"
                aria-checked={r === range}
                aria-label={`Last ${RANGE_LABELS[r]}`}
                onClick={() => setRange(r)}
                className={`h-8 rounded-full px-3 text-xs font-bold font-satoshi transition-colors ${
                  r === range
                    ? "bg-[#D85A30] text-white"
                    : "text-[#676565] hover:text-[#2F2F2F]"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {query.isError && !data ? (
        <WidgetError
          message={`Couldn't load the charts. ${errorMessage(query.error)}`}
          onRetry={() => void query.refetch()}
          retrying={query.isFetching}
        />
      ) : !data ? (
        <div
          aria-busy="true"
          aria-label="Loading charts"
          className="grid gap-6 lg:grid-cols-2"
        >
          {Array.from({ length: 2 }, (_, i) => (
            <div key={i}>
              <Skeleton className="h-4 w-40" />
              <Skeleton className="mt-3 h-40 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div
            className={`grid gap-6 lg:grid-cols-2 ${query.isFetching ? "opacity-60" : ""}`}
          >
            <AdminDashboardBarChart
              title={`Paid revenue (${currency})`}
              valueLabel={`Revenue (${currency})`}
              data={revenueData}
              formatValue={(n) => formatMoney(currency, n)}
              formatAxis={(n) => formatMoney(currency, n, { compact: true })}
            />
            <AdminDashboardBarChart
              title="Paid bookings"
              valueLabel="Bookings"
              data={bookingsData}
              formatValue={(n) => formatCountFull(n)}
              formatAxis={(n) => (Number.isInteger(n) ? formatCount(n) : "")}
            />
          </div>
          <p className="mt-3 text-xs font-medium font-satoshi text-[#9A9A9A]">
            {formatDate(data.from)} – {formatDate(data.to)} (UTC). Paid
            marketplace bookings plus ticketed flights; each currency is shown
            separately.
          </p>
          {query.isError ? (
            <div className="mt-3">
              <WidgetError
                message={`Refresh failed — showing the last loaded data. ${errorMessage(query.error)}`}
                onRetry={() => void query.refetch()}
                retrying={query.isFetching}
              />
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
