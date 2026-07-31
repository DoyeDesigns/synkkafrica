"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  adminHideReview,
  adminListReviews,
  adminPublishReview,
} from "@/lib/api/admin";

const STATUS_TABS = ["published", "hidden"] as const;
type StatusTab = (typeof STATUS_TABS)[number];

export function AdminReviewsLiveContent() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<StatusTab>("published");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-reviews", tab],
    queryFn: () => adminListReviews(token as string, tab),
    enabled: Boolean(token),
    refetchOnWindowFocus: false,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });

  const hideMutation = useMutation({
    mutationFn: (id: string) => adminHideReview(token as string, id),
    onSuccess: invalidate,
  });
  const publishMutation = useMutation({
    mutationFn: (id: string) => adminPublishReview(token as string, id),
    onSuccess: invalidate,
  });

  const reviews = data ?? [];
  const busy = hideMutation.isPending || publishMutation.isPending;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-satoshi text-[#2F2F2F]">
          Reviews
        </h1>
        <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
          Moderate customer reviews. Hiding one removes it from the listing and
          recomputes its rating.
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
      ) : reviews.length === 0 ? (
        <p className="rounded-lg border border-[#EEEEEE] bg-[#FAFAFA] px-4 py-6 text-center text-sm font-medium font-satoshi text-[#676565]">
          No {tab} reviews.
        </p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="flex flex-col gap-2 rounded-xl border border-[#EEEEEE] bg-white px-4 py-4 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < r.rating
                            ? "fill-[#FFCE31] text-[#FFCE31]"
                            : "fill-zinc-200 text-zinc-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-semibold font-satoshi text-[#2F2F2F]">
                    {r.listingTitle ?? "—"}
                  </span>
                </div>
                {r.comment ? (
                  <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
                    {r.comment}
                  </p>
                ) : null}
                <p className="mt-1 text-xs font-medium font-satoshi text-[#9A9A9A]">
                  {r.authorName ?? "Guest"} ·{" "}
                  {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="shrink-0">
                {r.status === "published" ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => hideMutation.mutate(r.id)}
                    className="rounded-lg border border-[#E5E5E5] px-3 py-2 text-xs font-bold font-satoshi text-[#C0392B] disabled:opacity-60"
                  >
                    Hide
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => publishMutation.mutate(r.id)}
                    className="rounded-lg bg-[#2E7D32] px-3 py-2 text-xs font-bold font-satoshi text-white disabled:opacity-60"
                  >
                    Publish
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
