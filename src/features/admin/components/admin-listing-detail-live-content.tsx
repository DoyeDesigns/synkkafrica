"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  adminApproveListing,
  adminApproveListingDocument,
  adminGetListing,
  adminListingDocViewUrl,
  adminRejectListing,
  adminRejectListingDocument,
  type AdminListing,
  type AdminListingDocument,
} from "@/lib/api/admin";
import { LIVE_QUERY_OPTIONS } from "@/lib/live-query-options";

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

const LISTING_STATUS_STYLES: Record<AdminListing["status"], string> = {
  draft: "bg-[#F5F5F5] text-[#676565]",
  pending: "bg-[#FDF3EF] text-[#D85A30]",
  live: "bg-[#E7F6EC] text-[#2E7D32]",
  paused: "bg-[#FFF4E5] text-[#9A7200]",
  rejected: "bg-[#FDEBEB] text-[#C0392B]",
};

const DOC_STATUS_STYLES: Record<AdminListingDocument["status"], string> = {
  pending: "bg-[#FDF3EF] text-[#D85A30]",
  approved: "bg-[#E7F6EC] text-[#2E7D32]",
  rejected: "bg-[#FDEBEB] text-[#C0392B]",
};

// Friendly names for the per-listing compliance document types (car,
// accommodation and experience categories share this set).
const DOC_LABELS: Record<string, string> = {
  cac: "CAC Registration Certificate",
  ownership: "Proof of Ownership",
  proof_of_ownership: "Proof of Ownership",
  address_photos: "Photos Matching Listed Address",
  roadworthiness: "Roadworthiness Certificate",
  insurance: "Insurance Certificate",
  agent_authorization: "Agent Authorization Letter",
  agent_proof_of_address: "Agent Proof of Address",
};

function docLabel(type: string) {
  return (
    DOC_LABELS[type] ??
    type
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

export function AdminListingDetailLiveContent({
  listingId,
}: {
  listingId: string;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.accessToken;
  const queryClient = useQueryClient();

  const { data: listing, isLoading, error: loadError } = useQuery({
    queryKey: ["admin-listing", listingId],
    queryFn: () => adminGetListing(token as string, listingId),
    enabled: Boolean(token),
    ...LIVE_QUERY_OPTIONS,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-listing", listingId] });
    void queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
  };

  // One inline error for every action on this page (moderation + documents).
  const [actionError, setActionError] = useState<string | null>(null);

  const approveMutation = useMutation({
    mutationFn: () => adminApproveListing(token as string, listingId),
    onMutate: () => setActionError(null),
    onSuccess: invalidate,
    // 409 when the listing is no longer pending or the vendor isn't verified.
    onError: (err) => {
      setActionError(errorMessage(err, "Couldn't approve this listing."));
      invalidate();
    },
  });
  const rejectMutation = useMutation({
    mutationFn: (reason?: string) =>
      adminRejectListing(token as string, listingId, reason),
    onMutate: () => setActionError(null),
    onSuccess: invalidate,
    onError: (err) => {
      setActionError(errorMessage(err, "Couldn't reject this listing."));
      invalidate();
    },
  });
  const busy = approveMutation.isPending || rejectMutation.isPending;

  const [docBusyId, setDocBusyId] = useState<string | null>(null);
  const docMutation = useMutation({
    mutationFn: (v: { id: string; action: "approve" | "reject"; reason?: string }) =>
      v.action === "approve"
        ? adminApproveListingDocument(token as string, v.id)
        : adminRejectListingDocument(token as string, v.id, v.reason),
    onMutate: ({ id }) => {
      setActionError(null);
      setDocBusyId(id);
    },
    onSuccess: invalidate,
    onError: (err, { action }) =>
      setActionError(
        errorMessage(
          err,
          action === "approve"
            ? "Couldn't approve this document."
            : "Couldn't reject this document.",
        ),
      ),
    onSettled: () => setDocBusyId(null),
  });

  const handleViewDoc = (id: string) => {
    const win = window.open("", "_blank");
    adminListingDocViewUrl(token as string, id)
      .then(({ url }) => {
        if (win) win.location.href = url;
      })
      .catch((err) => {
        win?.close();
        setActionError(errorMessage(err, "Couldn't open this document."));
      });
  };

  // The cover image plus any valid media entries (test data sometimes stores
  // malformed media like `[[], []]`, so guard for a real url). De-duplicated.
  const imageUrls = Array.from(
    new Set(
      [
        listing?.coverImageUrl ?? undefined,
        ...(listing?.media ?? []).map((m) => m?.url),
      ].filter((u): u is string => Boolean(u)),
    ),
  );

  return (
    <section className="space-y-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-sm font-bold font-satoshi text-[#135391] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        Back
      </button>

      {isLoading || !listing ? (
        <p
          className={`text-sm font-medium font-satoshi ${
            loadError ? "text-[#C0392B]" : "text-[#676565]"
          }`}
        >
          {isLoading
            ? "Loading…"
            : loadError
              ? errorMessage(loadError, "Couldn't load this listing.")
              : "Listing not found."}
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold font-satoshi text-[#2F2F2F]">
                {listing.title}
              </h1>
              <p className="mt-1 text-sm font-medium font-satoshi text-[#676565] capitalize">
                {listing.category} · {listing.location ?? "—"} ·{" "}
                <Link
                  href={`/admin/vendors/${listing.vendorId}`}
                  className="text-[#135391] hover:underline"
                >
                  {listing.vendorName}
                </Link>
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold font-satoshi capitalize ${LISTING_STATUS_STYLES[listing.status]}`}
              >
                {listing.status}
              </span>
              {listing.status === "pending" ? (
                <>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => approveMutation.mutate()}
                    className="rounded-lg bg-[#2E7D32] px-3 py-2 text-xs font-bold font-satoshi text-white disabled:opacity-60"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      const reason = window.prompt(
                        "Reason for rejection (shown to the vendor):",
                      );
                      // Cancelled prompt → don't reject.
                      if (reason === null) return;
                      rejectMutation.mutate(reason.trim() || undefined);
                    }}
                    className="rounded-lg border border-[#E5E5E5] px-3 py-2 text-xs font-bold font-satoshi text-[#C0392B] disabled:opacity-60"
                  >
                    Reject
                  </button>
                </>
              ) : null}
            </div>
          </div>

          {actionError ? (
            <div
              role="alert"
              className="flex items-start justify-between gap-3 rounded-lg border border-[#FDEBEB] bg-[#FDEBEB] px-4 py-3 text-sm font-medium font-satoshi text-[#C0392B]"
            >
              <span>{actionError}</span>
              <button
                type="button"
                onClick={() => setActionError(null)}
                className="shrink-0 font-bold hover:underline"
              >
                Dismiss
              </button>
            </div>
          ) : null}
          {listing.status !== "pending" ? (
            <p className="text-xs font-medium font-satoshi text-[#676565]">
              Only listings awaiting review can be approved or rejected.
            </p>
          ) : null}
          {listing.status === "rejected" && listing.rejectionReason ? (
            <p className="rounded-lg border border-[#FDEBEB] bg-[#FDEBEB] px-4 py-3 text-sm font-medium font-satoshi text-[#C0392B]">
              {listing.rejectionReason}
            </p>
          ) : null}

          {/* Media */}
          <div className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold font-satoshi text-[#2F2F2F]">
              Media ({imageUrls.length})
            </h2>
            {imageUrls.length === 0 ? (
              <p className="mt-3 text-sm font-medium font-satoshi text-[#676565]">
                No media uploaded.
              </p>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {imageUrls.map((url, i) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block overflow-hidden rounded-lg border border-[#EEEEEE]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Media ${i + 1}`}
                      className="h-32 w-full object-cover"
                    />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          {listing.shortDescription ? (
            <div className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm">
              <h2 className="text-base font-bold font-satoshi text-[#2F2F2F]">
                Description
              </h2>
              <p className="mt-3 whitespace-pre-wrap text-sm font-medium font-satoshi text-[#2F2F2F]">
                {listing.shortDescription}
              </p>
            </div>
          ) : null}

          {/* Compliance documents */}
          <div className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold font-satoshi text-[#2F2F2F]">
              Compliance documents
            </h2>
            {listing.documents.length === 0 ? (
              <p className="mt-3 text-sm font-medium font-satoshi text-[#676565]">
                No documents uploaded.
              </p>
            ) : (
              <div className="mt-4 space-y-2">
                {listing.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex flex-col gap-2 rounded-lg border border-[#EEEEEE] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold font-satoshi text-[#2F2F2F]">
                        {docLabel(doc.type)}
                      </p>
                      <p className="mt-0.5 truncate text-xs font-medium font-satoshi text-[#676565]">
                        {doc.fileName}
                      </p>
                      {doc.status === "rejected" && doc.rejectionReason ? (
                        <p className="mt-0.5 text-xs font-medium font-satoshi text-[#C0392B]">
                          {doc.rejectionReason}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {doc.fileUrl ? (
                        <button
                          type="button"
                          onClick={() => handleViewDoc(doc.id)}
                          className="text-xs font-bold font-satoshi text-[#135391] underline"
                        >
                          View
                        </button>
                      ) : (
                        <span className="text-xs font-medium font-satoshi italic text-[#9A9A9A]">
                          No file uploaded
                        </span>
                      )}
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold font-satoshi capitalize ${DOC_STATUS_STYLES[doc.status]}`}
                      >
                        {doc.status}
                      </span>
                      {doc.status !== "approved" ? (
                        <button
                          type="button"
                          disabled={docBusyId !== null}
                          onClick={() =>
                            docMutation.mutate({ id: doc.id, action: "approve" })
                          }
                          className="rounded-lg bg-[#2E7D32] px-3 py-1.5 text-xs font-bold font-satoshi text-white disabled:opacity-60"
                        >
                          {docBusyId === doc.id ? "…" : "Approve"}
                        </button>
                      ) : null}
                      {doc.status !== "rejected" ? (
                        <button
                          type="button"
                          disabled={docBusyId !== null}
                          onClick={() => {
                            const reason = window.prompt(
                              "Why is this document rejected? (shown to the vendor)",
                            );
                            if (reason === null) return;
                            docMutation.mutate({
                              id: doc.id,
                              action: "reject",
                              reason: reason.trim() || undefined,
                            });
                          }}
                          className="rounded-lg border border-[#E5E5E5] px-3 py-1.5 text-xs font-bold font-satoshi text-[#C0392B] disabled:opacity-60"
                        >
                          Reject
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
