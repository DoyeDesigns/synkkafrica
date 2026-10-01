"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  adminApproveVendor,
  adminListVendors,
  adminReactivateVendor,
  adminRejectVendor,
  adminSuspendVendor,
  type AdminVendor,
} from "@/lib/api/admin";
import { adminListVendorStats, type AdminVendorStats } from "@/lib/api/admin/vendor-insights";
import { useTranslation } from "@/hooks/use-translation";
import { LIVE_QUERY_OPTIONS } from "@/lib/live-query-options";
import {
  ConfirmDialog,
  EmptyState,
  ErrorBanner,
  FilterChips,
  NoticeBanner,
  Pagination,
  SearchBox,
  SkeletonTableRows,
  SortableTh,
  StatsBar,
  compareValues,
  errorMessage,
  focusRing,
  formatAmounts,
  formatDate,
  formatMoney,
  paginate,
  shortId,
  useNotice,
  useUrlSearch,
  useUrlState,
  type ConfirmConfig,
  type SortDir,
} from "@/features/admin/components/admin-people-kit";

const STATUS_FILTERS = ["all", "pending", "active", "suspended", "rejected"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const SORT_COLUMNS = ["name", "rating", "listings", "bookings", "revenue", "joined"] as const;
type SortColumn = (typeof SORT_COLUMNS)[number];

export const VENDOR_STATUS_LABELS: Record<AdminVendor["status"], string> = {
  pending: "Pending review",
  active: "Active",
  suspended: "Suspended",
  rejected: "Rejected",
};

export const VENDOR_STATUS_STYLES: Record<AdminVendor["status"], string> = {
  pending: "bg-[#FFF3E0] text-[#E65100]",
  active: "bg-[#E8F5E9] text-[#2E7D32]",
  suspended: "bg-[#F5F5F5] text-[#676565]",
  rejected: "bg-[#FDEBEB] text-[#C0392B]",
};

type Row = AdminVendor & { stats: AdminVendorStats | null };

type ActionKind = "approve" | "reject" | "suspend" | "reactivate";
type PendingAction = { kind: ActionKind; vendor: Row };

export function vendorActionConfig(kind: ActionKind, name: string, email: string): ConfirmConfig {
  switch (kind) {
    case "approve":
      return {
        title: `Approve ${name}?`,
        message: `${name} (${email}) will go live as a vendor: they can publish listings and take bookings. Their CAC registration must already be verified.`,
        confirmLabel: "Approve vendor",
        pendingLabel: "Approving…",
        tone: "success",
      };
    case "reject":
      return {
        title: `Reject ${name}?`,
        message: `${name}'s application will be rejected and they'll be notified. The reason below is shown to the vendor.`,
        confirmLabel: "Reject application",
        pendingLabel: "Rejecting…",
        tone: "danger",
        reason: {
          label: "Reason (optional, shown to the vendor)",
          placeholder: "e.g. CAC certificate doesn't match the business name",
          required: false,
          min: 3,
          max: 500,
        },
      };
    case "suspend":
      return {
        title: `Suspend ${name}?`,
        message: `${name} (${email}) will lose access to their vendor account until it is reactivated. They'll be notified to contact support.`,
        confirmLabel: "Suspend vendor",
        pendingLabel: "Suspending…",
        tone: "danger",
      };
    case "reactivate":
      return {
        title: `Reactivate ${name}?`,
        message: `${name} (${email}) will regain access to their vendor account.`,
        confirmLabel: "Reactivate vendor",
        pendingLabel: "Reactivating…",
        tone: "primary",
      };
  }
}

export const VENDOR_ACTION_SUCCESS: Record<ActionKind, (name: string) => string> = {
  approve: (n) => `${n} is approved and can now publish listings.`,
  reject: (n) => `${n}'s application was rejected.`,
  suspend: (n) => `${n} has been suspended.`,
  reactivate: (n) => `${n} has been reactivated.`,
};

export function runVendorAction(token: string, id: string, kind: ActionKind, reason: string) {
  switch (kind) {
    case "approve":
      return adminApproveVendor(token, id);
    case "reject":
      return adminRejectVendor(token, id, reason || undefined);
    case "suspend":
      return adminSuspendVendor(token, id);
    case "reactivate":
      return adminReactivateVendor(token, id);
  }
}

export function AdminVendorsLiveContent() {
  const t = useTranslation();
  const { data: session } = useSession();
  const token = session?.accessToken;
  const queryClient = useQueryClient();
  const { get, set, params } = useUrlState();
  const search = useUrlSearch("q");
  const { notice, setNotice, clear } = useNotice();
  const [action, setAction] = useState<PendingAction | null>(null);

  const statusParam = get("status", "all");
  const status: StatusFilter = (STATUS_FILTERS as readonly string[]).includes(statusParam)
    ? (statusParam as StatusFilter)
    : "all";
  const sortParam = get("sort", "joined");
  const sort: SortColumn = (SORT_COLUMNS as readonly string[]).includes(sortParam)
    ? (sortParam as SortColumn)
    : "joined";
  const dir: SortDir = get("dir", "desc") === "asc" ? "asc" : "desc";

  const vendorsQuery = useQuery({
    queryKey: ["admin-vendors", "all"],
    queryFn: () => adminListVendors(token as string),
    enabled: Boolean(token),
    ...LIVE_QUERY_OPTIONS,
  });
  const statsQuery = useQuery({
    queryKey: ["admin-vendor-insights"],
    queryFn: () => adminListVendorStats(token as string),
    enabled: Boolean(token),
    ...LIVE_QUERY_OPTIONS,
  });

  const mutation = useMutation({
    mutationFn: (v: { kind: ActionKind; row: Row; reason: string }) =>
      runVendorAction(token as string, v.row.id, v.kind, v.reason),
    onSuccess: async (_r, v) => {
      setAction(null);
      setNotice({ tone: "success", message: VENDOR_ACTION_SUCCESS[v.kind](v.row.businessName) });
      await queryClient.invalidateQueries({ queryKey: ["admin-vendors"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-vendor", v.row.id] });
      await queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
    },
  });

  const allRows = useMemo<Row[]>(() => {
    const stats = new Map((statsQuery.data?.vendors ?? []).map((s) => [s.vendorId, s]));
    return (vendorsQuery.data ?? []).map((v) => ({ ...v, stats: stats.get(v.id) ?? null }));
  }, [vendorsQuery.data, statsQuery.data]);

  const counts = useMemo(() => {
    const c: Record<StatusFilter, number> = { all: allRows.length, pending: 0, active: 0, suspended: 0, rejected: 0 };
    for (const r of allRows) c[r.status] += 1;
    return c;
  }, [allRows]);

  const filtered = useMemo(() => {
    const q = search.term;
    const rows = allRows.filter((v) => {
      if (status !== "all" && v.status !== status) return false;
      if (!q) return true;
      return (
        v.businessName.toLowerCase().includes(q) ||
        v.ownerFullName.toLowerCase().includes(q) ||
        v.email.toLowerCase().includes(q) ||
        (v.phoneNumber ?? "").toLowerCase().includes(q) ||
        v.id.toLowerCase().startsWith(q) ||
        shortId(v.id).toLowerCase().startsWith(q)
      );
    });
    const key = (r: Row): string | number | null => {
      switch (sort) {
        case "name":
          return r.businessName.toLowerCase();
        case "rating":
          return r.stats?.ratingAvg ?? null;
        case "listings":
          return r.stats?.listingsCount ?? 0;
        case "bookings":
          return r.stats?.bookingsCount ?? 0;
        case "revenue":
          return r.stats?.revenue[0]?.amount ?? 0;
        default:
          return Date.parse(r.createdAt);
      }
    };
    return [...rows].sort((a, b) => compareValues(key(a), key(b), dir));
  }, [allRows, search.term, status, sort, dir]);

  const pagination = paginate(filtered, get("page", "1"));

  const combinedRevenue = useMemo(() => {
    const acc = new Map<string, number>();
    for (const r of filtered)
      for (const s of r.stats?.revenue ?? []) acc.set(s.currency, (acc.get(s.currency) ?? 0) + s.amount);
    return [...acc.entries()].map(([currency, amount]) => ({ currency, amount })).sort((a, b) => b.amount - a.amount);
  }, [filtered]);

  const onSort = (column: string) => {
    if (column === sort) set({ dir: dir === "asc" ? "desc" : "asc", page: null });
    else set({ sort: column, dir: column === "name" ? "asc" : "desc", page: null });
  };

  const openAction = (next: PendingAction) => {
    mutation.reset();
    clear();
    setAction(next);
  };

  const hasFilters = Boolean(search.term) || status !== "all";
  const clearFilters = () => {
    search.setInput("");
    set({ q: null, status: null, page: null });
  };
  const backQs = params.toString();
  const loading = vendorsQuery.isLoading || (!token && !vendorsQuery.data);
  const commission = statsQuery.data?.platformSharePercent;

  return (
    <>
      <div>
        <h2 className="text-lg font-bold font-satoshi text-[#2F2F2F]">{t("admin.vendors.title")}</h2>
        <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
          Review vendor applications and manage active vendors.
        </p>
      </div>

      <StatsBar
        items={[
          { label: t("admin.vendors.stats.found"), value: loading ? "…" : String(filtered.length) },
          {
            label: t("admin.vendors.stats.active"),
            value: loading ? "…" : String(filtered.filter((v) => v.status === "active").length),
          },
          {
            label: t("admin.vendors.stats.combinedRevenue"),
            value: statsQuery.isLoading ? "…" : formatAmounts(combinedRevenue, formatMoney(0, "NGN")),
          },
          {
            label: t("admin.vendors.stats.page"),
            value: t("admin.vendors.stats.pageValue", {
              current: pagination.currentPage,
              total: pagination.totalPages,
            }),
          },
        ]}
      />

      <NoticeBanner notice={notice} onDismiss={clear} />

      {vendorsQuery.isError ? (
        <ErrorBanner
          message={errorMessage(vendorsQuery.error, "Couldn't load vendors.")}
          onRetry={() => void vendorsQuery.refetch()}
          retrying={vendorsQuery.isFetching}
        />
      ) : null}
      {statsQuery.isError ? (
        <ErrorBanner
          message={`Ratings, listings and revenue couldn't be loaded: ${errorMessage(statsQuery.error)}`}
          onRetry={() => void statsQuery.refetch()}
          retrying={statsQuery.isFetching}
        />
      ) : null}

      <SearchBox
        value={search.input}
        onChange={search.setInput}
        label="Search vendors"
        placeholder={t("admin.vendors.searchPlaceholder")}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterChips
          label="Filter by vendor status"
          options={[
            { value: "all", label: t("admin.common.all") },
            { value: "pending", label: "Pending review" },
            { value: "active", label: t("admin.vendors.status.active") },
            { value: "suspended", label: "Suspended" },
            { value: "rejected", label: "Rejected" },
          ]}
          value={status}
          counts={loading ? undefined : counts}
          onChange={(v) => set({ status: v === "all" ? null : v, page: null })}
        />
        <p className="text-sm font-medium font-satoshi text-[#676565]" aria-live="polite">
          {loading ? "Loading vendors…" : `${filtered.length} ${filtered.length === 1 ? "vendor" : "vendors"}`}
        </p>
      </div>

      <div className="max-h-[70vh] overflow-auto rounded-xl border border-[#EEEEEE] bg-white shadow-sm">
        <table className="w-full min-w-[1250px] text-left text-sm font-satoshi">
          <thead className="sticky top-0 z-10 border-b border-[#F0F0F0] bg-[#FAFAFA] text-xs font-semibold uppercase text-[#676565]">
            <tr>
              <th scope="col" className="min-w-[100px] px-4 py-3">
                {t("admin.vendors.vendorId")}
              </th>
              <SortableTh label={t("admin.vendors.name")} column="name" sort={sort} dir={dir} onSort={onSort} className="min-w-[180px]" />
              <th scope="col" className="min-w-[190px] px-4 py-3">
                {t("admin.vendors.contactInfo")}
              </th>
              <SortableTh label={t("admin.vendors.rating")} column="rating" sort={sort} dir={dir} onSort={onSort} className="min-w-[130px]" />
              <SortableTh label={t("admin.vendors.listings")} column="listings" sort={sort} dir={dir} onSort={onSort} align="right" />
              <SortableTh label="Bookings" column="bookings" sort={sort} dir={dir} onSort={onSort} align="right" />
              <th scope="col" className="px-4 py-3 text-right">
                {t("admin.vendors.commission")}
              </th>
              <th scope="col" className="min-w-[120px] px-4 py-3">
                Status
              </th>
              <SortableTh label={t("admin.vendors.revenue")} column="revenue" sort={sort} dir={dir} onSort={onSort} align="right" className="min-w-[130px]" />
              <th scope="col" className="min-w-[230px] px-4 py-3">
                {t("admin.common.actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F0F0]">
            {loading ? (
              <SkeletonTableRows cols={10} />
            ) : pagination.items.length > 0 ? (
              pagination.items.map((row) => (
                <VendorRow
                  key={row.id}
                  row={row}
                  statsLoading={statsQuery.isLoading}
                  commission={commission}
                  busy={mutation.isPending && mutation.variables?.row.id === row.id}
                  detailHref={`/admin/vendors/${row.id}${backQs ? `?back=${encodeURIComponent(backQs)}` : ""}`}
                  onAction={(kind) => openAction({ kind, vendor: row })}
                />
              ))
            ) : (
              <tr>
                <td colSpan={10}>
                  <EmptyState
                    message={
                      hasFilters
                        ? status !== "all" && !search.term
                          ? `No ${VENDOR_STATUS_LABELS[status as AdminVendor["status"]].toLowerCase()} vendors.`
                          : t("admin.vendors.empty")
                        : "No vendors have signed up yet."
                    }
                    actionLabel={hasFilters ? "Clear search and filters" : undefined}
                    onAction={hasFilters ? clearFilters : undefined}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 ? (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={(page) => set({ page: page === 1 ? null : page })}
          label={t("admin.vendors.pagination.showing", {
            current: pagination.currentPage,
            total: pagination.totalPages,
          })}
        />
      ) : null}

      {action ? (
        <ConfirmDialog
          key={`${action.kind}-${action.vendor.id}`}
          config={vendorActionConfig(action.kind, action.vendor.businessName, action.vendor.email)}
          pending={mutation.isPending}
          error={mutation.error ? errorMessage(mutation.error) : null}
          onClose={() => setAction(null)}
          onConfirm={(reason) => mutation.mutate({ kind: action.kind, row: action.vendor, reason })}
        />
      ) : null}
    </>
  );
}

function VendorRow({
  row,
  statsLoading,
  commission,
  busy,
  detailHref,
  onAction,
}: {
  row: Row;
  statsLoading: boolean;
  commission: number | undefined;
  busy: boolean;
  detailHref: string;
  onAction: (kind: ActionKind) => void;
}) {
  const t = useTranslation();
  const s = row.stats;
  const dash = statsLoading ? "…" : "—";
  const toggleable = row.status === "active" || row.status === "suspended";
  const enabled = row.status === "active";

  return (
    <tr className="hover:bg-[#FCFCFD]">
      <td className="px-4 py-4 font-mono text-xs font-medium whitespace-nowrap text-[#676565]" title={row.id}>
        {shortId(row.id)}
      </td>
      <td className="px-4 py-4">
        <Link href={detailHref} className={`font-bold text-[#2F2F2F] hover:text-[#135391] hover:underline ${focusRing}`}>
          {row.businessName}
        </Link>
        <p className="mt-0.5 text-xs text-[#676565]">
          {row.ownerFullName} · {row.businessType}
        </p>
        <p className="text-xs text-[#9E9E9E]">Joined {formatDate(row.createdAt)}</p>
      </td>
      <td className="px-4 py-4">
        <p className="font-medium whitespace-nowrap text-[#2F2F2F]">{row.phoneNumber ?? "—"}</p>
        <p className="mt-0.5 break-all text-xs text-[#676565]">{row.email}</p>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        {s?.ratingAvg !== null && s?.ratingAvg !== undefined ? (
          <>
            <span className="inline-flex items-center gap-1 font-semibold text-[#D85A30]">
              <Star className="h-3.5 w-3.5 fill-current" aria-hidden />
              {s.ratingAvg.toFixed(1)}
            </span>
            <span className="text-[#676565]">
              {" "}
              ({s.reviewCount} {t("admin.vendors.reviews")})
            </span>
          </>
        ) : (
          <span className="text-[#9E9E9E]">{statsLoading ? "…" : "No reviews"}</span>
        )}
      </td>
      <td className="px-4 py-4 text-right whitespace-nowrap tabular-nums">
        <span className="font-semibold text-[#2F2F2F]">{s ? s.listingsCount : statsLoading ? "…" : 0}</span>
        {s && s.listingsCount > 0 ? <p className="text-xs text-[#676565]">{s.liveListings} live</p> : null}
      </td>
      <td className="px-4 py-4 text-right font-semibold whitespace-nowrap text-[#2F2F2F] tabular-nums">
        {s ? s.bookingsCount : statsLoading ? "…" : 0}
      </td>
      <td className="px-4 py-4 text-right font-medium whitespace-nowrap text-[#2F2F2F] tabular-nums">
        {commission !== undefined ? t("admin.vendors.commissionValue", { rate: commission }) : dash}
      </td>
      <td className="px-4 py-4">
        <span
          title={row.rejectionReason ?? undefined}
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${VENDOR_STATUS_STYLES[row.status]}`}
        >
          {VENDOR_STATUS_LABELS[row.status]}
        </span>
      </td>
      <td className="px-4 py-4 text-right font-semibold whitespace-nowrap text-[#2F2F2F] tabular-nums">
        {s ? formatAmounts(s.revenue) : dash}
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-nowrap items-center gap-2" role="group" aria-label={`Actions for ${row.businessName}`}>
          {toggleable ? (
            <>
              <button
                type="button"
                aria-pressed={enabled}
                disabled={busy || enabled}
                onClick={() => onAction("reactivate")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold whitespace-nowrap disabled:cursor-default ${focusRing} ${
                  enabled ? "bg-[#E8F5E9] text-[#2E7D32]" : "border border-[#E5E5E5] bg-white text-[#676565] hover:bg-[#FAFAFA]"
                }`}
              >
                {busy && !enabled ? "Enabling…" : t("admin.common.enabled")}
              </button>
              <button
                type="button"
                aria-pressed={!enabled}
                disabled={busy || !enabled}
                onClick={() => onAction("suspend")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold whitespace-nowrap disabled:cursor-default ${focusRing} ${
                  !enabled ? "bg-[#F5F5F5] text-[#676565]" : "border border-[#E5E5E5] bg-white text-[#676565] hover:bg-[#FAFAFA]"
                }`}
              >
                {busy && enabled ? "Disabling…" : t("admin.common.disabled")}
              </button>
            </>
          ) : row.status === "pending" ? (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() => onAction("approve")}
                className={`rounded-lg bg-[#2E7D32] px-3 py-1.5 text-xs font-bold whitespace-nowrap text-white hover:opacity-90 disabled:opacity-60 ${focusRing}`}
              >
                Approve
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => onAction("reject")}
                className={`rounded-lg border border-[#F5C2C2] bg-white px-3 py-1.5 text-xs font-bold whitespace-nowrap text-[#C0392B] hover:bg-[#FDEBEB] disabled:opacity-60 ${focusRing}`}
              >
                Reject
              </button>
            </>
          ) : null}
          <Link
            href={detailHref}
            aria-label={`View details for ${row.businessName}`}
            className={`inline-flex rounded-lg border border-[#135391] px-3 py-1.5 text-xs font-bold whitespace-nowrap text-[#135391] transition-colors hover:bg-[#F0F6FC] ${focusRing}`}
          >
            {t("admin.vendors.details")}
          </Link>
        </div>
      </td>
    </tr>
  );
}
