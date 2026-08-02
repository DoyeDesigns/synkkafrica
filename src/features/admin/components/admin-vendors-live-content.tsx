"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  adminApproveVendor,
  adminListVendors,
  adminRejectVendor,
  type AdminVendor,
} from "@/lib/api/admin";

const STATUS_TABS = ["pending", "active", "suspended", "rejected"] as const;
type StatusTab = (typeof STATUS_TABS)[number];

const STATUS_STYLES: Record<AdminVendor["status"], string> = {
  pending: "bg-[#FDF3EF] text-[#D85A30]",
  active: "bg-[#E7F6EC] text-[#2E7D32]",
  suspended: "bg-[#FFF4E5] text-[#9A7200]",
  rejected: "bg-[#FDEBEB] text-[#C0392B]",
};

export function AdminVendorsLiveContent() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<StatusTab>("pending");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-vendors", tab],
    queryFn: () => adminListVendors(token as string, tab),
    enabled: Boolean(token),
    refetchOnWindowFocus: false,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin-vendors"] });

  const approveMutation = useMutation({
    mutationFn: (id: string) => adminApproveVendor(token as string, id),
    onSuccess: invalidate,
  });
  const rejectMutation = useMutation({
    mutationFn: (v: { id: string; reason?: string }) =>
      adminRejectVendor(token as string, v.id, v.reason),
    onSuccess: invalidate,
  });

  const vendors = data ?? [];
  const busyId =
    approveMutation.isPending
      ? approveMutation.variables
      : rejectMutation.isPending
        ? rejectMutation.variables?.id
        : undefined;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-satoshi text-[#2F2F2F]">
          Vendors
        </h1>
        <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
          Review and approve vendor applications.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setTab(s)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold font-satoshi capitalize transition-colors ${
              tab === s
                ? "bg-[#135391] text-white"
                : "border border-[#E5E5E5] bg-white text-[#676565] hover:bg-[#F5F5F5]"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm font-medium font-satoshi text-[#676565]">
          Loading…
        </p>
      ) : vendors.length === 0 ? (
        <p className="rounded-lg border border-[#EEEEEE] bg-[#FAFAFA] px-4 py-6 text-center text-sm font-medium font-satoshi text-[#676565]">
          No {tab} vendors.
        </p>
      ) : (
        <div className="space-y-3">
          {vendors.map((v) => (
            <div
              key={v.id}
              className="flex flex-col gap-3 rounded-xl border border-[#EEEEEE] bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <Link
                href={`/admin/vendors/${v.id}`}
                className="group min-w-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#135391]"
              >
                <p className="truncate text-sm font-bold font-satoshi text-[#2F2F2F] group-hover:text-[#135391] group-hover:underline">
                  {v.businessName}
                </p>
                <p className="mt-0.5 truncate text-xs font-medium font-satoshi text-[#676565]">
                  {v.ownerFullName} · {v.email} · {v.businessType}
                </p>
                {v.rejectionReason ? (
                  <p className="mt-1 text-xs font-medium font-satoshi text-[#C0392B]">
                    {v.rejectionReason}
                  </p>
                ) : null}
              </Link>

              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold font-satoshi capitalize ${STATUS_STYLES[v.status]}`}
                >
                  {v.status}
                </span>
                {v.status === "pending" ? (
                  <>
                    <button
                      type="button"
                      disabled={busyId === v.id}
                      onClick={() => approveMutation.mutate(v.id)}
                      className="rounded-lg bg-[#2E7D32] px-3 py-2 text-xs font-bold font-satoshi text-white disabled:opacity-60"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={busyId === v.id}
                      onClick={() => {
                        const reason =
                          window.prompt("Reason for rejection (optional):") ??
                          undefined;
                        rejectMutation.mutate({ id: v.id, reason });
                      }}
                      className="rounded-lg border border-[#E5E5E5] px-3 py-2 text-xs font-bold font-satoshi text-[#C0392B] disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
