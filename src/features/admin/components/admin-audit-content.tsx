"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { adminListAuditLog, type AdminAuditEntry } from "@/lib/api/admin";

const PAGE_SIZE = 50;

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

function formatWhen(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function targetLabel(entry: AdminAuditEntry) {
  if (!entry.targetType) return "—";
  const id = entry.targetId ? ` · ${entry.targetId.slice(0, 8)}` : "";
  return `${entry.targetType}${id}`;
}

export function AdminAuditContent() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const [module, setModule] = useState<string>("");
  const [offset, setOffset] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-audit", module, offset],
    queryFn: () =>
      adminListAuditLog(token as string, {
        module: module || undefined,
        limit: PAGE_SIZE,
        offset,
      }),
    enabled: Boolean(token),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageStart = total === 0 ? 0 : offset + 1;
  const pageEnd = Math.min(offset + PAGE_SIZE, total);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-satoshi text-[#2F2F2F]">
          Audit log
        </h1>
        <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
          Every state-changing admin action, most recent first.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={module}
          onChange={(e) => {
            setModule(e.target.value);
            setOffset(0);
          }}
          className="h-10 rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm font-satoshi outline-none focus:border-[#135391]"
        >
          <option value="">All modules</option>
          {MODULES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <span className="text-xs font-medium font-satoshi text-[#676565]">
          {total > 0 ? `${pageStart}–${pageEnd} of ${total}` : "No entries"}
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#EEEEEE] bg-white">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[#EEEEEE] bg-[#FAFAFA] text-xs font-bold font-satoshi uppercase tracking-wide text-[#9A9A9A]">
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Admin</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Module</th>
              <th className="px-4 py-3">Target</th>
              <th className="px-4 py-3">IP</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-sm font-medium font-satoshi text-[#676565]"
                >
                  Loading…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-sm font-medium font-satoshi text-[#676565]"
                >
                  No audit entries.
                </td>
              </tr>
            ) : (
              items.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-b border-[#F2F2F2] text-sm font-satoshi text-[#2F2F2F] last:border-0"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-[#676565]">
                    {formatWhen(entry.occurredAt)}
                  </td>
                  <td className="px-4 py-3">
                    {entry.adminEmail ?? entry.adminId.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    <code className="rounded bg-[#F5F5F5] px-1.5 py-0.5 text-xs">
                      {entry.action}
                    </code>
                  </td>
                  <td className="px-4 py-3 capitalize text-[#676565]">
                    {entry.module}
                  </td>
                  <td className="px-4 py-3 text-[#676565]">
                    {targetLabel(entry)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-[#9A9A9A]">
                    {entry.ip ?? "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          disabled={offset === 0}
          onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
          className="rounded-lg border border-[#E5E5E5] px-4 py-2 text-sm font-bold font-satoshi text-[#2F2F2F] disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={offset + PAGE_SIZE >= total}
          onClick={() => setOffset((o) => o + PAGE_SIZE)}
          className="rounded-lg border border-[#E5E5E5] px-4 py-2 text-sm font-bold font-satoshi text-[#2F2F2F] disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </section>
  );
}
