"use client";

import { Fragment, useMemo, useState } from "react";
import { ChevronDown, ScrollText } from "lucide-react";
import { useSession } from "next-auth/react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { adminListAuditLog, type AdminAuditEntry } from "@/lib/api/admin";
import { LIVE_QUERY_OPTIONS } from "@/lib/live-query-options";
import {
  AdminPageHeader,
  EmptyState,
  ErrorBanner,
  PAGE_SIZE,
  Pagination,
  SearchInput,
  SkeletonTableRows,
  errorMessage,
  focusRing,
  formatDateTime,
  useUrlSearch,
  useUrlState,
} from "@/features/admin/components/admin-ui";

// Filterable modules (the marketplace + platform audit areas).
const MODULES = [
  "vendors",
  "listings",
  "payouts",
  "documents",
  "reviews",
  "support",
  "adminTeam",
  "bookings",
  "refunds",
  "markup",
] as const;

const MODULE_LABELS: Record<string, string> = {
  adminTeam: "Admin team",
};

function moduleLabel(m: string) {
  return MODULE_LABELS[m] ?? m.charAt(0).toUpperCase() + m.slice(1);
}

function targetLabel(entry: AdminAuditEntry) {
  if (!entry.targetType) return "—";
  const id = entry.targetId ? ` · ${entry.targetId.slice(0, 8)}` : "";
  return `${entry.targetType}${id}`;
}

function prettyJson(value: unknown) {
  if (value === null || value === undefined) return "—";
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

const COLS = 7;

export function AdminAuditContent() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const { get, set } = useUrlState();
  const { input, setInput, term } = useUrlSearch();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const moduleFilter = get("module");
  const requestedPage = Math.max(1, Number.parseInt(get("page", "1"), 10) || 1);
  const offset = (requestedPage - 1) * PAGE_SIZE;

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["admin-audit", moduleFilter, offset],
    queryFn: () =>
      adminListAuditLog(token as string, {
        module: moduleFilter || undefined,
        limit: PAGE_SIZE,
        offset,
      }),
    enabled: Boolean(token),
    placeholderData: keepPreviousData,
    ...LIVE_QUERY_OPTIONS,
  });

  const items = useMemo(() => data?.items ?? [], [data]);
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // The search narrows the page that's loaded (the API filters by module only).
  const visible = useMemo(() => {
    if (!term) return items;
    return items.filter((e) =>
      [
        e.adminEmail,
        e.adminId,
        e.action,
        e.module,
        e.targetType,
        e.targetId,
        e.ip,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term)),
    );
  }, [items, term]);

  const hasFilters = Boolean(moduleFilter || term);

  return (
    <section className="space-y-6">
      <AdminPageHeader
        title="Audit log"
        description="Every state-changing admin action, most recent first. Click a row to see what changed."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={input}
          onChange={setInput}
          placeholder="Filter by admin, action, target or IP"
          label="Filter audit entries on this page"
          className="sm:w-80"
        />
        <label className="sr-only" htmlFor="audit-module">
          Module
        </label>
        <select
          id="audit-module"
          value={moduleFilter}
          onChange={(e) => set({ module: e.target.value, page: null })}
          className={`h-10 rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm font-medium font-satoshi outline-none focus:border-[#135391] ${focusRing}`}
        >
          <option value="">All modules</option>
          {MODULES.map((m) => (
            <option key={m} value={m}>
              {moduleLabel(m)}
            </option>
          ))}
        </select>
        {hasFilters ? (
          <button
            type="button"
            onClick={() => {
              setInput("");
              set({ module: null, q: null, page: null });
            }}
            className={`h-10 rounded-lg px-3 text-sm font-bold font-satoshi text-[#135391] hover:bg-[#F0F6FC] ${focusRing}`}
          >
            Clear filters
          </button>
        ) : null}
        <p
          aria-live="polite"
          className="text-xs font-semibold font-satoshi text-[#676565] sm:ml-auto"
        >
          {isLoading
            ? "Loading entries…"
            : term
              ? `${visible.length} match${visible.length === 1 ? "" : "es"} on this page · ${total} total`
              : `${total} entr${total === 1 ? "y" : "ies"}`}
          {isFetching && !isLoading ? " · refreshing…" : ""}
        </p>
      </div>

      {error ? (
        <ErrorBanner
          message={errorMessage(error, "Couldn't load the audit log.")}
          onRetry={() => void refetch()}
          retrying={isFetching}
        />
      ) : null}

      {!isLoading && !error && visible.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title={hasFilters ? "No matching entries" : "No audit entries yet"}
          description={
            hasFilters
              ? "Try another module or clear the search."
              : "Admin actions such as approvals, payouts and team changes will be recorded here."
          }
        />
      ) : (
        <div className="max-h-[70vh] overflow-auto rounded-xl border border-[#EEEEEE] bg-white">
          <table className="w-full min-w-[820px] border-collapse text-left">
            <thead className="sticky top-0 z-10 bg-[#FAFAFA]">
              <tr className="border-b border-[#EEEEEE] text-xs font-bold font-satoshi uppercase tracking-wide text-[#9A9A9A]">
                <th scope="col" className="w-8 px-2 py-3">
                  <span className="sr-only">Details</span>
                </th>
                <th scope="col" className="px-4 py-3">
                  When
                </th>
                <th scope="col" className="px-4 py-3">
                  Admin
                </th>
                <th scope="col" className="px-4 py-3">
                  Action
                </th>
                <th scope="col" className="px-4 py-3">
                  Module
                </th>
                <th scope="col" className="px-4 py-3">
                  Target
                </th>
                <th scope="col" className="px-4 py-3">
                  IP
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <SkeletonTableRows cols={COLS} />
              ) : (
                visible.map((entry) => {
                  const expanded = expandedId === entry.id;
                  return (
                    <Fragment key={entry.id}>
                      <tr
                        className={`border-b border-[#F2F2F2] text-sm font-satoshi text-[#2F2F2F] hover:bg-[#FAFCFF] ${
                          expanded ? "bg-[#F7F9FC]" : ""
                        }`}
                      >
                        <td className="px-2 py-3">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedId(expanded ? null : entry.id)
                            }
                            aria-expanded={expanded}
                            aria-label={`${expanded ? "Hide" : "Show"} details for ${entry.action}`}
                            className={`rounded p-1 text-[#676565] hover:bg-[#EEEEEE] ${focusRing}`}
                          >
                            <ChevronDown
                              className={`h-4 w-4 transition-transform ${
                                expanded ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-[#676565]">
                          {formatDateTime(entry.occurredAt)}
                        </td>
                        <td className="max-w-[220px] truncate px-4 py-3">
                          {entry.adminEmail ?? entry.adminId.slice(0, 8)}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          <code className="rounded bg-[#F5F5F5] px-1.5 py-0.5 text-xs">
                            {entry.action}
                          </code>
                        </td>
                        <td className="px-4 py-3 text-[#676565]">
                          {moduleLabel(entry.module)}
                        </td>
                        <td className="px-4 py-3 text-[#676565]">
                          {targetLabel(entry)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-[#9A9A9A]">
                          {entry.ip ?? "—"}
                        </td>
                      </tr>
                      {expanded ? (
                        <tr className="border-b border-[#F2F2F2] bg-[#F7F9FC]">
                          <td />
                          <td colSpan={COLS - 1} className="px-4 pb-4 pt-1">
                            <dl className="grid gap-x-6 gap-y-1 text-xs font-medium font-satoshi text-[#676565] sm:grid-cols-2">
                              <div>
                                <dt className="inline font-bold">
                                  Target ID:{" "}
                                </dt>
                                <dd className="inline break-all">
                                  {entry.targetId ?? "—"}
                                </dd>
                              </div>
                              <div>
                                <dt className="inline font-bold">
                                  Request ID:{" "}
                                </dt>
                                <dd className="inline break-all">
                                  {entry.requestId ?? "—"}
                                </dd>
                              </div>
                              <div className="sm:col-span-2">
                                <dt className="inline font-bold">
                                  User agent:{" "}
                                </dt>
                                <dd className="inline break-all">
                                  {entry.userAgent ?? "—"}
                                </dd>
                              </div>
                            </dl>
                            <div className="mt-3 grid gap-3 md:grid-cols-2">
                              {(
                                [
                                  ["Before", entry.before],
                                  ["After", entry.after],
                                ] as const
                              ).map(([label, value]) => (
                                <div key={label}>
                                  <p className="text-xs font-bold font-satoshi text-[#2F2F2F]">
                                    {label}
                                  </p>
                                  <pre className="mt-1 max-h-60 overflow-auto rounded-lg border border-[#EEEEEE] bg-white p-3 text-[11px] leading-relaxed text-[#3C3C3C]">
                                    {prettyJson(value)}
                                  </pre>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        page={Math.min(requestedPage, pageCount)}
        pageCount={pageCount}
        total={total}
        onPage={(p) => {
          setExpandedId(null);
          set({ page: p <= 1 ? null : p });
        }}
      />
    </section>
  );
}
