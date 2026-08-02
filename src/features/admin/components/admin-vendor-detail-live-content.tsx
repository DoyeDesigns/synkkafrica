"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  adminApproveVendor,
  adminBusinessDocViewUrl,
  adminGetVendor,
  adminRejectVendor,
  type AdminBusinessDoc,
  type AdminListing,
  type AdminVendor,
} from "@/lib/api/admin";

const VENDOR_STATUS_STYLES: Record<AdminVendor["status"], string> = {
  pending: "bg-[#FDF3EF] text-[#D85A30]",
  active: "bg-[#E7F6EC] text-[#2E7D32]",
  suspended: "bg-[#FFF4E5] text-[#9A7200]",
  rejected: "bg-[#FDEBEB] text-[#C0392B]",
};

const DOC_STATUS_STYLES: Record<AdminBusinessDoc["status"], string> = {
  pending: "bg-[#FDF3EF] text-[#D85A30]",
  approved: "bg-[#E7F6EC] text-[#2E7D32]",
  rejected: "bg-[#FDEBEB] text-[#C0392B]",
};

const LISTING_STATUS_STYLES: Record<AdminListing["status"], string> = {
  draft: "bg-[#F5F5F5] text-[#676565]",
  pending: "bg-[#FDF3EF] text-[#D85A30]",
  live: "bg-[#E7F6EC] text-[#2E7D32]",
  paused: "bg-[#FFF4E5] text-[#9A7200]",
  rejected: "bg-[#FDEBEB] text-[#C0392B]",
};

const DOC_LABELS: Record<string, string> = {
  government_id: "Government ID",
  cac_certificate: "CAC Certificate",
  proof_of_address: "Proof of Address",
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function AdminVendorDetailLiveContent({
  vendorId,
}: {
  vendorId: string;
}) {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const queryClient = useQueryClient();

  const { data: vendor, isLoading } = useQuery({
    queryKey: ["admin-vendor", vendorId],
    queryFn: () => adminGetVendor(token as string, vendorId),
    enabled: Boolean(token),
    refetchOnWindowFocus: false,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-vendor", vendorId] });
    queryClient.invalidateQueries({ queryKey: ["admin-vendors"] });
  };

  const approveMutation = useMutation({
    mutationFn: () => adminApproveVendor(token as string, vendorId),
    onSuccess: invalidate,
  });
  const rejectMutation = useMutation({
    mutationFn: (reason?: string) =>
      adminRejectVendor(token as string, vendorId, reason),
    onSuccess: invalidate,
  });
  const busy = approveMutation.isPending || rejectMutation.isPending;

  // Open a blank tab synchronously (survives popup blockers), then redirect it
  // to the short-lived signed URL once fetched.
  const handleViewDoc = (id: string) => {
    const win = window.open("", "_blank");
    adminBusinessDocViewUrl(token as string, id)
      .then(({ url }) => {
        if (win) win.location.href = url;
      })
      .catch(() => win?.close());
  };

  return (
    <section className="space-y-6">
      <Link
        href="/admin/vendors"
        className="inline-flex items-center gap-1.5 text-sm font-bold font-satoshi text-[#135391] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        Back to vendors
      </Link>

      {isLoading || !vendor ? (
        <p className="text-sm font-medium font-satoshi text-[#676565]">
          {isLoading ? "Loading…" : "Vendor not found."}
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold font-satoshi text-[#2F2F2F]">
                {vendor.businessName}
              </h1>
              <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
                {vendor.ownerFullName} · {vendor.email}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold font-satoshi capitalize ${VENDOR_STATUS_STYLES[vendor.status]}`}
              >
                {vendor.status}
              </span>
              {vendor.status === "pending" ? (
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

          {vendor.rejectionReason ? (
            <p className="rounded-lg border border-[#FDEBEB] bg-[#FDEBEB] px-4 py-3 text-sm font-medium font-satoshi text-[#C0392B]">
              {vendor.rejectionReason}
            </p>
          ) : null}

          {/* Business details */}
          <div className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold font-satoshi text-[#2F2F2F]">
              Business details
            </h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <DetailRow label="Business type" value={vendor.businessType} />
              <DetailRow label="Phone" value={vendor.phoneNumber} />
              <DetailRow
                label="CAC registration"
                value={vendor.cacRegistrationNumber}
              />
              <DetailRow label="Address" value={vendor.businessAddress} />
              <DetailRow
                label="Date of birth"
                value={formatDate(vendor.dateOfBirth)}
              />
              <DetailRow label="Onboarded" value={formatDate(vendor.createdAt)} />
              <DetailRow
                label="Payout account"
                value={
                  vendor.payoutAccountNumber
                    ? `${vendor.payoutAccountName ?? ""} · ${vendor.payoutAccountNumber}`
                    : null
                }
              />
              <DetailRow label="Payout bank" value={vendor.payoutBankId} />
            </dl>
          </div>

          {/* KYC documents */}
          <div className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold font-satoshi text-[#2F2F2F]">
              KYC documents
            </h2>
            {vendor.documents.length === 0 ? (
              <p className="mt-3 text-sm font-medium font-satoshi text-[#676565]">
                No documents uploaded.
              </p>
            ) : (
              <div className="mt-4 space-y-2">
                {vendor.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex flex-col gap-2 rounded-lg border border-[#EEEEEE] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold font-satoshi text-[#2F2F2F]">
                        {DOC_LABELS[doc.type] ?? doc.type}
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

          {/* Listings */}
          <div className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold font-satoshi text-[#2F2F2F]">
              Listings ({vendor.listings.length})
            </h2>
            {vendor.listings.length === 0 ? (
              <p className="mt-3 text-sm font-medium font-satoshi text-[#676565]">
                No listings yet.
              </p>
            ) : (
              <div className="mt-4 space-y-2">
                {vendor.listings.map((listing) => (
                  <Link
                    key={listing.id}
                    href={`/admin/listings/${listing.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-[#EEEEEE] px-4 py-3 transition-colors hover:border-[#135391] hover:bg-[#F8FBFF]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold font-satoshi text-[#2F2F2F]">
                        {listing.title}
                      </p>
                      <p className="mt-0.5 truncate text-xs font-medium font-satoshi text-[#676565] capitalize">
                        {listing.category} · {listing.location ?? "—"}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold font-satoshi capitalize ${LISTING_STATUS_STYLES[listing.status]}`}
                    >
                      {listing.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <dt className="text-xs font-semibold font-satoshi uppercase tracking-wide text-[#9A9A9A]">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium font-satoshi text-[#2F2F2F]">
        {value?.trim() ? value : "—"}
      </dd>
    </div>
  );
}
