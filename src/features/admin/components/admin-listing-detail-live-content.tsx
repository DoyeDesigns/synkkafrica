"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  adminApproveListing,
  adminGetListing,
  adminListingDocViewUrl,
  adminRejectListing,
  type AdminListing,
  type AdminListingDocument,
} from "@/lib/api/admin";

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

  const { data: listing, isLoading } = useQuery({
    queryKey: ["admin-listing", listingId],
    queryFn: () => adminGetListing(token as string, listingId),
    enabled: Boolean(token),
    refetchOnWindowFocus: false,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-listing", listingId] });
    queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
  };

  const approveMutation = useMutation({
    mutationFn: () => adminApproveListing(token as string, listingId),
    onSuccess: invalidate,
  });
  const rejectMutation = useMutation({
    mutationFn: (reason?: string) =>
      adminRejectListing(token as string, listingId, reason),
    onSuccess: invalidate,
  });
  const busy = approveMutation.isPending || rejectMutation.isPending;
  const approveError =
    approveMutation.error instanceof Error ? approveMutation.error.message : null;

  const handleViewDoc = (id: string) => {
    const win = window.open("", "_blank");
    adminListingDocViewUrl(token as string, id)
      .then(({ url }) => {
        if (win) win.location.href = url;
      })
      .catch(() => win?.close());
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
        <p className="text-sm font-medium font-satoshi text-[#676565]">
          {isLoading ? "Loading…" : "Listing not found."}
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
                      const reason =
                        window.prompt("Reason for rejection (optional):") ??
                        undefined;
                      rejectMutation.mutate(reason);
                    }}
                    className="rounded-lg border border-[#E5E5E5] px-3 py-2 text-xs font-bold font-satoshi text-[#C0392B] disabled:opacity-60"
                  >
                    Reject
                  </button>
                </>
              ) : null}
            </div>
          </div>

          {approveError ? (
            <p className="rounded-lg border border-[#FDEBEB] bg-[#FDEBEB] px-4 py-3 text-sm font-medium font-satoshi text-[#C0392B]">
              {approveError}
            </p>
          ) : null}
          {listing.rejectionReason ? (
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
