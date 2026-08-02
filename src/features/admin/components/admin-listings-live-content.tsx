"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  adminApproveListing,
  adminListListings,
  adminRejectListing,
  type AdminListing,
} from "@/lib/api/admin";

const STATUS_TABS = ["pending", "live", "paused", "rejected"] as const;
type StatusTab = (typeof STATUS_TABS)[number];

const STATUS_STYLES: Record<AdminListing["status"], string> = {
  draft: "bg-[#EEEEEE] text-[#5A5A5A]",
  pending: "bg-[#FDF3EF] text-[#D85A30]",
  live: "bg-[#E7F6EC] text-[#2E7D32]",
  paused: "bg-[#FFF4E5] text-[#9A7200]",
  rejected: "bg-[#FDEBEB] text-[#C0392B]",
};

export function AdminListingsLiveContent({
  category,
  title,
}: {
  category?: AdminListing["category"];
  title: string;
}) {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<StatusTab>("pending");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-listings", tab],
    queryFn: () => adminListListings(token as string, tab),
    enabled: Boolean(token),
    refetchOnWindowFocus: false,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin-listings"] });

  const approveMutation = useMutation({
    mutationFn: (id: string) => adminApproveListing(token as string, id),
    onSuccess: invalidate,
  });
  const approveError =
    approveMutation.isError && approveMutation.variables
      ? {
          id: approveMutation.variables,
          message:
            approveMutation.error instanceof Error
              ? approveMutation.error.message
              : "Couldn't approve this listing.",
        }
      : null;
  const rejectMutation = useMutation({
    mutationFn: (v: { id: string; reason?: string }) =>
      adminRejectListing(token as string, v.id, v.reason),
    onSuccess: invalidate,
  });

  const listings = useMemo(
    () =>
      (data ?? []).filter((l) => !category || l.category === category),
    [data, category],
  );
  const busyId = approveMutation.isPending
    ? approveMutation.variables
    : rejectMutation.isPending
      ? rejectMutation.variables?.id
      : undefined;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-satoshi text-[#2F2F2F]">
          {title}
        </h1>
        <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
          Approve listings to make them visible to customers.
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
      ) : listings.length === 0 ? (
        <p className="rounded-lg border border-[#EEEEEE] bg-[#FAFAFA] px-4 py-6 text-center text-sm font-medium font-satoshi text-[#676565]">
          No {tab} listings.
        </p>
      ) : (
        <div className="space-y-3">
          {listings.map((l) => (
            <div
              key={l.id}
              className="flex flex-col gap-3 rounded-xl border border-[#EEEEEE] bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <Link
                  href={`/admin/listings/${l.id}`}
                  className="group inline-block max-w-full rounded outline-none focus-visible:ring-2 focus-visible:ring-[#135391]"
                >
                  <p className="truncate text-sm font-bold font-satoshi text-[#2F2F2F] group-hover:text-[#135391] group-hover:underline">
                    {l.title}
                  </p>
                </Link>
                <p className="mt-0.5 truncate text-xs font-medium font-satoshi text-[#676565] capitalize">
                  {l.category} · {l.location ?? "—"}
                </p>
                {l.rejectionReason ? (
                  <p className="mt-1 text-xs font-medium font-satoshi text-[#C0392B]">
                    {l.rejectionReason}
                  </p>
                ) : null}
                {approveError?.id === l.id ? (
                  <p className="mt-1 text-xs font-medium font-satoshi text-[#C0392B]">
                    {approveError.message}
                  </p>
                ) : null}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold font-satoshi capitalize ${STATUS_STYLES[l.status]}`}
                >
                  {l.status}
                </span>
                {l.status === "pending" ? (
                  <>
                    <button
                      type="button"
                      disabled={busyId === l.id}
                      onClick={() => approveMutation.mutate(l.id)}
                      className="rounded-lg bg-[#2E7D32] px-3 py-2 text-xs font-bold font-satoshi text-white disabled:opacity-60"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={busyId === l.id}
                      onClick={() => {
                        const reason =
                          window.prompt("Reason for rejection (optional):") ??
                          undefined;
                        rejectMutation.mutate({ id: l.id, reason });
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
