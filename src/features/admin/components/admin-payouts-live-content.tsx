"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  adminApprovePayout,
  adminListPayouts,
  adminRejectPayout,
  type AdminPayout,
} from "@/lib/api/admin";

const STATUS_TABS = ["pending", "completed", "failed"] as const;
type StatusTab = (typeof STATUS_TABS)[number];

const STATUS_STYLES: Record<AdminPayout["status"], string> = {
  pending: "bg-[#FDF3EF] text-[#D85A30]",
  completed: "bg-[#E7F6EC] text-[#2E7D32]",
  failed: "bg-[#FDEBEB] text-[#C0392B]",
};

export function AdminPayoutsLiveContent() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<StatusTab>("pending");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-payouts", tab],
    queryFn: () => adminListPayouts(token as string, tab),
    enabled: Boolean(token),
    refetchOnWindowFocus: false,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin-payouts"] });

  const approveMutation = useMutation({
    mutationFn: (id: string) => adminApprovePayout(token as string, id),
    onSuccess: invalidate,
  });
  const rejectMutation = useMutation({
    mutationFn: (id: string) => adminRejectPayout(token as string, id),
    onSuccess: invalidate,
  });

  const payouts = data ?? [];
  const busy = approveMutation.isPending || rejectMutation.isPending;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-satoshi text-[#2F2F2F]">
          Payouts
        </h1>
        <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
          Review and approve vendor withdrawal requests.
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
      ) : payouts.length === 0 ? (
        <p className="rounded-lg border border-[#EEEEEE] bg-[#FAFAFA] px-4 py-6 text-center text-sm font-medium font-satoshi text-[#676565]">
          No {tab} payouts.
        </p>
      ) : (
        <div className="space-y-3">
          {payouts.map((p) => (
            <div
              key={p.id}
              className="flex flex-col gap-3 rounded-xl border border-[#EEEEEE] bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-sm font-bold font-satoshi text-[#2F2F2F]">
                  {p.currency} {p.amount.toLocaleString()}
                </p>
                <p className="mt-0.5 truncate text-xs font-medium font-satoshi text-[#676565]">
                  {p.title} · {new Date(p.occurredAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold font-satoshi capitalize ${STATUS_STYLES[p.status]}`}
                >
                  {p.status}
                </span>
                {p.status === "pending" ? (
                  <>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => approveMutation.mutate(p.id)}
                      className="rounded-lg bg-[#2E7D32] px-3 py-2 text-xs font-bold font-satoshi text-white disabled:opacity-60"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        if (window.confirm("Decline this payout?"))
                          rejectMutation.mutate(p.id);
                      }}
                      className="rounded-lg border border-[#E5E5E5] px-3 py-2 text-xs font-bold font-satoshi text-[#C0392B] disabled:opacity-60"
                    >
                      Decline
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
