"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  adminApproveBusinessDoc,
  adminListBusinessDocs,
  adminRejectBusinessDoc,
  type AdminBusinessDoc,
} from "@/lib/api/admin";

const STATUS_TABS = ["pending", "approved", "rejected"] as const;
type StatusTab = (typeof STATUS_TABS)[number];

const STATUS_STYLES: Record<AdminBusinessDoc["status"], string> = {
  pending: "bg-[#FDF3EF] text-[#D85A30]",
  approved: "bg-[#E7F6EC] text-[#2E7D32]",
  rejected: "bg-[#FDEBEB] text-[#C0392B]",
};

const DOC_LABELS: Record<string, string> = {
  government_id: "Government ID",
  cac_certificate: "CAC Certificate",
  proof_of_address: "Proof of Address",
};

export function AdminVerificationsLiveContent() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<StatusTab>("pending");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-business-docs", tab],
    queryFn: () => adminListBusinessDocs(token as string, tab),
    enabled: Boolean(token),
    refetchOnWindowFocus: false,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin-business-docs"] });

  const approveMutation = useMutation({
    mutationFn: (id: string) => adminApproveBusinessDoc(token as string, id),
    onSuccess: invalidate,
  });
  const rejectMutation = useMutation({
    mutationFn: (id: string) => adminRejectBusinessDoc(token as string, id),
    onSuccess: invalidate,
  });

  const docs = data ?? [];
  const busy = approveMutation.isPending || rejectMutation.isPending;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-satoshi text-[#2F2F2F]">
          Verifications
        </h1>
        <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
          Review vendor KYC documents (government ID, CAC, proof of address).
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
      ) : docs.length === 0 ? (
        <p className="rounded-lg border border-[#EEEEEE] bg-[#FAFAFA] px-4 py-6 text-center text-sm font-medium font-satoshi text-[#676565]">
          No {tab} documents.
        </p>
      ) : (
        <div className="space-y-3">
          {docs.map((d) => (
            <div
              key={d.id}
              className="flex flex-col gap-3 rounded-xl border border-[#EEEEEE] bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-sm font-bold font-satoshi text-[#2F2F2F]">
                  {DOC_LABELS[d.type] ?? d.type}
                </p>
                <p className="mt-0.5 truncate text-xs font-medium font-satoshi text-[#676565]">
                  {d.fileName}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {d.fileUrl ? (
                  <a
                    href={d.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold font-satoshi text-[#135391] underline"
                  >
                    View
                  </a>
                ) : null}
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold font-satoshi capitalize ${STATUS_STYLES[d.status]}`}
                >
                  {d.status}
                </span>
                {d.status === "pending" ? (
                  <>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => approveMutation.mutate(d.id)}
                      className="rounded-lg bg-[#2E7D32] px-3 py-2 text-xs font-bold font-satoshi text-white disabled:opacity-60"
                    >
                      Verify
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        if (window.confirm("Reject this document?"))
                          rejectMutation.mutate(d.id);
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
