"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  adminBlockCustomer,
  adminListCustomers,
  adminUnblockCustomer,
  type AdminCustomer,
} from "@/lib/api/admin";
import {
  adminListCustomerActivity,
  type AdminCustomerActivity,
} from "@/lib/api/admin/customers";
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
  initials,
  paginate,
  shortId,
  useNotice,
  useUrlSearch,
  useUrlState,
  type ConfirmConfig,
  type SortDir,
} from "@/features/admin/components/admin-people-kit";

const STATUS_FILTERS = ["all", "active", "blocked"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const SORT_COLUMNS = ["name", "bookings", "spend", "joined", "lastBooking"] as const;
type SortColumn = (typeof SORT_COLUMNS)[number];

const AVATAR_STYLES = [
  "bg-[#ECEFF1] text-[#546E7A]",
  "bg-[#FBE9E7] text-[#BF360C]",
  "bg-[#E8F5E9] text-[#2E7D32]",
  "bg-[#FFF3E0] text-[#E65100]",
  "bg-[#E3F2FD] text-[#1565C0]",
];

type Row = AdminCustomer & {
  name: string;
  activity: AdminCustomerActivity | null;
};

type PendingAction = { kind: "block" | "unblock"; customer: Row };

export function displayCustomerName(c: {
  firstName: string | null;
  lastName: string | null;
  email: string;
}) {
  return [c.firstName, c.lastName].filter(Boolean).join(" ") || c.email;
}

function blockConfig(action: PendingAction): ConfirmConfig {
  const name = action.customer.name;
  return action.kind === "block"
    ? {
        title: `Disable ${name}?`,
        message: `${name} (${action.customer.email}) will be signed out everywhere and won't be able to sign in or use their account until re-enabled. Guest checkout by email is not affected.`,
        confirmLabel: "Disable account",
        pendingLabel: "Disabling…",
        tone: "danger",
        reason: {
          label: "Reason (required, recorded in the audit log)",
          placeholder: "e.g. Repeated chargeback fraud",
          required: true,
          min: 3,
          max: 500,
        },
      }
    : {
        title: `Re-enable ${name}?`,
        message: `${name} (${action.customer.email}) will be able to sign in again. They'll need to sign in afresh — previous sessions stay revoked.`,
        confirmLabel: "Enable account",
        pendingLabel: "Enabling…",
        tone: "primary",
      };
}

export function AdminUsersLiveContent() {
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

  const customersQuery = useQuery({
    queryKey: ["admin-customers"],
    queryFn: () => adminListCustomers(token as string),
    enabled: Boolean(token),
    ...LIVE_QUERY_OPTIONS,
  });
  const activityQuery = useQuery({
    queryKey: ["admin-customer-activity"],
    queryFn: () => adminListCustomerActivity(token as string),
    enabled: Boolean(token),
    ...LIVE_QUERY_OPTIONS,
  });

  const onDone = async (message: string) => {
    setAction(null);
    setNotice({ tone: "success", message });
    await queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
    await queryClient.invalidateQueries({ queryKey: ["admin-customer"] });
  };

  const blockMutation = useMutation({
    mutationFn: (v: { row: Row; reason: string }) =>
      adminBlockCustomer(token as string, v.row.id, v.reason),
    onSuccess: (_r, v) => onDone(`${v.row.name} has been disabled and signed out.`),
  });
  const unblockMutation = useMutation({
    mutationFn: (row: Row) => adminUnblockCustomer(token as string, row.id),
    onSuccess: (_r, row) => onDone(`${row.name} can sign in again.`),
  });
  const pending = blockMutation.isPending || unblockMutation.isPending;

  const allRows = useMemo<Row[]>(() => {
    const activity = new Map((activityQuery.data ?? []).map((a) => [a.userId, a]));
    return (customersQuery.data ?? []).map((c) => ({
      ...c,
      name: displayCustomerName(c),
      activity: activity.get(c.id) ?? null,
    }));
  }, [customersQuery.data, activityQuery.data]);

  const counts = useMemo(() => {
    const blocked = allRows.filter((r) => r.disabledAt).length;
    return { all: allRows.length, blocked, active: allRows.length - blocked };
  }, [allRows]);

  const filtered = useMemo(() => {
    const q = search.term;
    const rows = allRows.filter((c) => {
      if (status === "blocked" && !c.disabledAt) return false;
      if (status === "active" && c.disabledAt) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phoneNumber ?? "").toLowerCase().includes(q) ||
        c.id.toLowerCase().startsWith(q) ||
        shortId(c.id).toLowerCase().startsWith(q)
      );
    });
    const key = (r: Row): string | number | null => {
      switch (sort) {
        case "name":
          return r.name.toLowerCase();
        case "bookings":
          return r.activity?.bookingsCount ?? 0;
        case "spend":
          return r.activity?.spend[0]?.amount ?? 0;
        case "lastBooking":
          return r.activity?.lastBookingAt ? Date.parse(r.activity.lastBookingAt) : null;
        default:
          return Date.parse(r.createdAt);
      }
    };
    return [...rows].sort((a, b) => compareValues(key(a), key(b), dir));
  }, [allRows, search.term, status, sort, dir]);

  const pagination = paginate(filtered, get("page", "1"));

  const combinedSpend = useMemo(() => {
    const acc = new Map<string, number>();
    for (const r of filtered)
      for (const s of r.activity?.spend ?? []) acc.set(s.currency, (acc.get(s.currency) ?? 0) + s.amount);
    return [...acc.entries()]
      .map(([currency, amount]) => ({ currency, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [filtered]);

  const onSort = (column: string) => {
    if (column === sort) set({ dir: dir === "asc" ? "desc" : "asc", page: null });
    else set({ sort: column, dir: column === "name" ? "asc" : "desc", page: null });
  };

  const openAction = (next: PendingAction) => {
    blockMutation.reset();
    unblockMutation.reset();
    clear();
    setAction(next);
  };

  const hasFilters = Boolean(search.term) || status !== "all";
  const clearFilters = () => {
    search.setInput("");
    set({ q: null, status: null, page: null });
  };
  const backQs = params.toString();
  const loading = customersQuery.isLoading || (!token && !customersQuery.data);
  const actionError = blockMutation.error ?? unblockMutation.error;

  return (
    <>
      <div>
        <h2 className="text-lg font-bold font-satoshi text-[#2F2F2F]">{t("admin.users.title")}</h2>
        <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
          Registered customer accounts, their bookings and spend.
        </p>
      </div>

      <StatsBar
        items={[
          { label: t("admin.users.stats.found"), value: loading ? "…" : String(filtered.length) },
          {
            label: t("admin.users.stats.active"),
            value: loading ? "…" : String(filtered.filter((r) => !r.disabledAt).length),
          },
          {
            label: t("admin.users.stats.combinedSpend"),
            value: activityQuery.isLoading ? "…" : formatAmounts(combinedSpend, formatMoney(0, "NGN")),
          },
          {
            label: t("admin.users.stats.page"),
            value: t("admin.users.stats.pageValue", {
              current: pagination.currentPage,
              total: pagination.totalPages,
            }),
          },
        ]}
      />

      <NoticeBanner notice={notice} onDismiss={clear} />

      {customersQuery.isError ? (
        <ErrorBanner
          message={errorMessage(customersQuery.error, "Couldn't load customers.")}
          onRetry={() => void customersQuery.refetch()}
          retrying={customersQuery.isFetching}
        />
      ) : null}
      {activityQuery.isError ? (
        <ErrorBanner
          message={`Bookings and spend couldn't be loaded: ${errorMessage(activityQuery.error)}`}
          onRetry={() => void activityQuery.refetch()}
          retrying={activityQuery.isFetching}
        />
      ) : null}

      <SearchBox
        value={search.input}
        onChange={search.setInput}
        label="Search customers"
        placeholder="Search by name, user ID, email or phone…"
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterChips
          label="Filter by account status"
          options={[
            { value: "all", label: t("admin.common.all") },
            { value: "active", label: t("admin.users.status.active") },
            { value: "blocked", label: "Disabled" },
          ]}
          value={status}
          counts={loading ? undefined : counts}
          onChange={(v) => set({ status: v === "all" ? null : v, page: null })}
        />
        <p className="text-sm font-medium font-satoshi text-[#676565]" aria-live="polite">
          {loading ? "Loading customers…" : `${filtered.length} ${filtered.length === 1 ? "customer" : "customers"}`}
        </p>
      </div>

      <div className="max-h-[70vh] overflow-auto rounded-xl border border-[#EEEEEE] bg-white shadow-sm">
        <table className="w-full min-w-[1150px] text-left text-sm font-satoshi">
          <thead className="sticky top-0 z-10 border-b border-[#F0F0F0] bg-[#FAFAFA] text-xs font-semibold uppercase text-[#676565]">
            <tr>
              <th scope="col" className="min-w-[100px] px-4 py-3">
                {t("admin.users.userId")}
              </th>
              <SortableTh label={t("admin.users.traveler")} column="name" sort={sort} dir={dir} onSort={onSort} className="min-w-[180px]" />
              <th scope="col" className="min-w-[200px] px-4 py-3">
                {t("admin.users.contact")}
              </th>
              <SortableTh label="Bookings" column="bookings" sort={sort} dir={dir} onSort={onSort} align="right" />
              <SortableTh label="Spend" column="spend" sort={sort} dir={dir} onSort={onSort} align="right" className="min-w-[130px]" />
              <SortableTh label="Joined" column="joined" sort={sort} dir={dir} onSort={onSort} className="min-w-[110px]" />
              <SortableTh label="Last booking" column="lastBooking" sort={sort} dir={dir} onSort={onSort} className="min-w-[120px]" />
              <th scope="col" className="min-w-[100px] px-4 py-3">
                Status
              </th>
              <th scope="col" className="min-w-[220px] px-4 py-3">
                {t("admin.common.actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F0F0]">
            {loading ? (
              <SkeletonTableRows cols={9} />
            ) : pagination.items.length > 0 ? (
              pagination.items.map((row, index) => (
                <UserRow
                  key={row.id}
                  row={row}
                  avatarStyle={AVATAR_STYLES[index % AVATAR_STYLES.length]!}
                  activityLoading={activityQuery.isLoading}
                  busy={
                    (blockMutation.isPending && blockMutation.variables?.row.id === row.id) ||
                    (unblockMutation.isPending && unblockMutation.variables?.id === row.id)
                  }
                  detailHref={`/admin/users/${row.id}${backQs ? `?back=${encodeURIComponent(backQs)}` : ""}`}
                  onBlock={() => openAction({ kind: "block", customer: row })}
                  onUnblock={() => openAction({ kind: "unblock", customer: row })}
                />
              ))
            ) : (
              <tr>
                <td colSpan={9}>
                  <EmptyState
                    message={hasFilters ? t("admin.users.empty") : "No customer accounts yet."}
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
          label={t("admin.users.pagination.showing", {
            current: pagination.currentPage,
            total: pagination.totalPages,
          })}
        />
      ) : null}

      {action ? (
        <ConfirmDialog
          key={`${action.kind}-${action.customer.id}`}
          config={blockConfig(action)}
          pending={pending}
          error={actionError ? errorMessage(actionError) : null}
          onClose={() => setAction(null)}
          onConfirm={(reason) => {
            if (action.kind === "block") blockMutation.mutate({ row: action.customer, reason });
            else unblockMutation.mutate(action.customer);
          }}
        />
      ) : null}
    </>
  );
}

function UserRow({
  row,
  avatarStyle,
  activityLoading,
  busy,
  detailHref,
  onBlock,
  onUnblock,
}: {
  row: Row;
  avatarStyle: string;
  activityLoading: boolean;
  busy: boolean;
  detailHref: string;
  onBlock: () => void;
  onUnblock: () => void;
}) {
  const t = useTranslation();
  const blocked = Boolean(row.disabledAt);
  const a = row.activity;

  return (
    <tr className="hover:bg-[#FCFCFD]">
      <td className="px-4 py-4 font-mono text-xs font-medium whitespace-nowrap text-[#676565]" title={row.id}>
        {shortId(row.id)}
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${avatarStyle}`}
          >
            {initials(row.name)}
          </span>
          <div className="min-w-0">
            <Link href={detailHref} className={`font-bold text-[#2F2F2F] hover:text-[#135391] hover:underline ${focusRing}`}>
              {row.name}
            </Link>
            {row.deleted ? (
              <p className="text-[11px] font-semibold text-[#C0392B]">Deletion requested</p>
            ) : !row.emailVerified ? (
              <p className="text-[11px] font-semibold text-[#9A7200]">Email unverified</p>
            ) : null}
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <p className="font-medium break-all text-[#2F2F2F]">{row.email}</p>
        {row.phoneNumber ? <p className="mt-0.5 text-xs text-[#676565]">{row.phoneNumber}</p> : null}
      </td>
      <td className="px-4 py-4 text-right font-semibold whitespace-nowrap text-[#2F2F2F] tabular-nums">
        {activityLoading ? "…" : (a?.bookingsCount ?? 0)}
      </td>
      <td className="px-4 py-4 text-right whitespace-nowrap text-[#2F2F2F] tabular-nums">
        {activityLoading ? "…" : formatAmounts(a?.spend ?? [])}
      </td>
      <td className="px-4 py-4 font-medium whitespace-nowrap text-[#676565]">{formatDate(row.createdAt)}</td>
      <td className="px-4 py-4 font-medium whitespace-nowrap text-[#676565]">
        {activityLoading ? "…" : formatDate(a?.lastBookingAt)}
      </td>
      <td className="px-4 py-4">
        <span
          title={blocked ? (row.disabledReason ?? undefined) : undefined}
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${
            blocked ? "bg-[#FDEBEB] text-[#C0392B]" : "bg-[#E8F5E9] text-[#2E7D32]"
          }`}
        >
          {blocked ? "Disabled" : t("admin.users.status.active")}
        </span>
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-nowrap items-center gap-2" role="group" aria-label={`Account access for ${row.name}`}>
          <button
            type="button"
            aria-pressed={!blocked}
            disabled={busy || !blocked}
            onClick={onUnblock}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold whitespace-nowrap disabled:cursor-default ${focusRing} ${
              !blocked
                ? "bg-[#E8F5E9] text-[#2E7D32]"
                : "border border-[#E5E5E5] bg-white text-[#676565] hover:bg-[#FAFAFA]"
            }`}
          >
            {busy && blocked ? "Enabling…" : t("admin.common.enabled")}
          </button>
          <button
            type="button"
            aria-pressed={blocked}
            disabled={busy || blocked || row.deleted}
            onClick={onBlock}
            title={row.deleted ? "This account is being deleted" : undefined}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold whitespace-nowrap disabled:cursor-default ${focusRing} ${
              blocked
                ? "bg-[#FDEBEB] text-[#C0392B]"
                : "border border-[#E5E5E5] bg-white text-[#676565] hover:bg-[#FAFAFA] disabled:opacity-50"
            }`}
          >
            {busy && !blocked ? "Disabling…" : t("admin.common.disabled")}
          </button>
          <Link
            href={detailHref}
            aria-label={`View details for ${row.name}`}
            className={`inline-flex rounded-lg border border-[#135391] px-3 py-1.5 text-xs font-bold whitespace-nowrap text-[#135391] transition-colors hover:bg-[#F0F6FC] ${focusRing}`}
          >
            {t("admin.users.details")}
          </Link>
        </div>
      </td>
    </tr>
  );
}
