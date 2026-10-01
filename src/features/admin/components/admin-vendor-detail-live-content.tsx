"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Ban,
  Check,
  Copy,
  ExternalLink,
  List,
  Mail,
  MoreVertical,
  Power,
  RotateCcw,
  ShieldAlert,
  Wallet,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  adminApproveVendorWithoutVerification,
  adminBusinessDocViewUrl,
  adminGetVendor,
  adminVerifyVendorCac,
  adminVerifyVendorId,
  type AdminBusinessDoc,
  type AdminListing,
  type AdminVendorDetail,
  type VerificationStatus,
} from "@/lib/api/admin";
import { ApiError } from "@/lib/api/backend";
import { adminGetVendorInsights, type AdminVendorInsights } from "@/lib/api/admin/vendor-insights";
import { useTranslation } from "@/hooks/use-translation";
import { LIVE_QUERY_OPTIONS } from "@/lib/live-query-options";
import {
  VENDOR_ACTION_SUCCESS,
  VENDOR_STATUS_LABELS,
  VENDOR_STATUS_STYLES,
  runVendorAction,
  vendorActionConfig,
} from "@/features/admin/components/admin-vendors-live-content";
import {
  BADGE_STYLES,
  ConfirmDialog,
  DetailCard,
  DetailRow,
  ErrorBanner,
  MenuDivider,
  MenuItem,
  MenuSection,
  MetricCard,
  NoticeBanner,
  Skeleton,
  errorMessage,
  focusRing,
  formatAmounts,
  formatDate,
  formatMoney,
  formatRelative,
  shortId,
  useDismiss,
  useNotice,
  useUrlState,
  type BadgeTone,
  type ConfirmConfig,
} from "@/features/admin/components/admin-people-kit";

const DOC_LABELS: Record<string, string> = {
  government_id: "Government ID",
  cac_certificate: "CAC certificate",
  proof_of_address: "Proof of address",
};

const DOC_STATUS: Record<AdminBusinessDoc["status"], { label: string; tone: BadgeTone }> = {
  pending: { label: "Pending review", tone: "pending" },
  approved: { label: "Verified", tone: "verified" },
  rejected: { label: "Rejected", tone: "failed" },
};

const AUTO_CHECK: Record<VerificationStatus, { label: string; tone: BadgeTone }> = {
  unverified: { label: "Not run", tone: "notVerified" },
  verified: { label: "Passed", tone: "verified" },
  failed: { label: "Failed", tone: "failed" },
};

const LISTING_STATUS_STYLES: Record<AdminListing["status"], string> = {
  draft: "bg-[#F5F5F5] text-[#676565]",
  pending: "bg-[#FFF3E0] text-[#E65100]",
  live: "bg-[#E8F5E9] text-[#2E7D32]",
  paused: "bg-[#FFF8E1] text-[#9A7200]",
  rejected: "bg-[#FDEBEB] text-[#C0392B]",
};

const BOOKING_STATUS: Record<string, { label: string; className: string }> = {
  awaiting_confirmation: { label: "Awaiting vendor", className: "bg-[#FFF3E0] text-[#E65100]" },
  confirmed: { label: "Confirmed", className: "bg-[#E8F5E9] text-[#2E7D32]" },
  completed: { label: "Completed", className: "bg-[#E3F2FD] text-[#1565C0]" },
  declined: { label: "Declined", className: "bg-[#FDEBEB] text-[#C0392B]" },
  cancelled: { label: "Cancelled", className: "bg-[#F5F5F5] text-[#676565]" },
};

type ActionKind = "approve" | "reject" | "suspend" | "reactivate" | "bypass";

function prettyType(type: string) {
  return type.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

function isNotFound(err: unknown) {
  return err instanceof ApiError && (err.status === 404 || err.status === 400);
}

export function AdminVendorDetailLiveContent({ vendorId }: { vendorId: string }) {
  const t = useTranslation();
  const { data: session } = useSession();
  const token = session?.accessToken;
  const queryClient = useQueryClient();
  const { get } = useUrlState();
  const back = get("back");
  const backHref = back ? `/admin/vendors?${back}` : "/admin/vendors";
  const { notice, setNotice, clear } = useNotice();
  const [action, setAction] = useState<ActionKind | null>(null);

  const vendorQuery = useQuery({
    queryKey: ["admin-vendor", vendorId],
    queryFn: () => adminGetVendor(token as string, vendorId),
    enabled: Boolean(token),
    retry: (count, err) => !isNotFound(err) && count < 2,
    ...LIVE_QUERY_OPTIONS,
  });
  const insightsQuery = useQuery({
    queryKey: ["admin-vendor", vendorId, "insights"],
    queryFn: () => adminGetVendorInsights(token as string, vendorId),
    enabled: Boolean(token),
    retry: (count, err) => !isNotFound(err) && count < 2,
    ...LIVE_QUERY_OPTIONS,
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin-vendor", vendorId] });
    await queryClient.invalidateQueries({ queryKey: ["admin-vendors"] });
    await queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
    await queryClient.invalidateQueries({ queryKey: ["admin-business-docs"] });
    await queryClient.invalidateQueries({ queryKey: ["admin-verification-queue"] });
  };

  const actionMutation = useMutation({
    mutationFn: (v: { kind: ActionKind; reason: string }) =>
      v.kind === "bypass"
        ? adminApproveVendorWithoutVerification(token as string, vendorId, v.reason)
        : runVendorAction(token as string, vendorId, v.kind, v.reason),
    onSuccess: async (result, v) => {
      setAction(null);
      setNotice({
        tone: "success",
        message: VENDOR_ACTION_SUCCESS[v.kind === "bypass" ? "approve" : v.kind](result.businessName),
      });
      await invalidate();
    },
  });
  const verifyCacMutation = useMutation({
    mutationFn: () => adminVerifyVendorCac(token as string, vendorId),
    onSuccess: async (r) => {
      setNotice({
        tone: r.cacVerificationStatus === "verified" ? "success" : "error",
        message:
          r.cacVerificationStatus === "verified"
            ? `CAC verified${r.cacVerifiedName ? ` — registry name: ${r.cacVerifiedName}` : ""}.`
            : "CAC lookup ran but the registration could not be verified.",
      });
      await invalidate();
    },
    onError: (err) => setNotice({ tone: "error", message: `CAC verification failed to run: ${errorMessage(err)}` }),
  });
  const verifyIdMutation = useMutation({
    mutationFn: () => adminVerifyVendorId(token as string, vendorId),
    onSuccess: async (r) => {
      setNotice({
        tone: r.verificationStatus === "verified" ? "success" : "error",
        message:
          r.verificationStatus === "verified"
            ? "Government ID passed automated verification."
            : "Government ID did not pass automated verification.",
      });
      await invalidate();
    },
    onError: (err) => setNotice({ tone: "error", message: `ID verification failed to run: ${errorMessage(err)}` }),
  });

  const openAction = (kind: ActionKind) => {
    actionMutation.reset();
    clear();
    setAction(kind);
  };

  // Open a blank tab synchronously (survives popup blockers), then point it at
  // the short-lived signed URL once fetched.
  const handleViewDoc = (id: string) => {
    const win = window.open("", "_blank");
    adminBusinessDocViewUrl(token as string, id)
      .then(({ url }) => {
        if (win) win.location.href = url;
      })
      .catch((err: unknown) => {
        win?.close();
        setNotice({ tone: "error", message: `Couldn't open the document: ${errorMessage(err)}` });
      });
  };

  const backLink = (
    <Link
      href={backHref}
      className={`inline-flex items-center gap-1.5 rounded text-sm font-bold font-satoshi text-[#135391] hover:underline ${focusRing}`}
    >
      <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
      {t("admin.vendors.backToList")}
    </Link>
  );

  if (vendorQuery.isError && isNotFound(vendorQuery.error)) {
    return (
      <div className="space-y-6">
        {backLink}
        <div className="rounded-xl border border-[#EEEEEE] bg-white p-10 text-center shadow-sm">
          <p className="text-sm font-medium font-satoshi text-[#676565]">{t("admin.vendors.notFound")}</p>
        </div>
      </div>
    );
  }

  const vendor = vendorQuery.data;
  const insights = insightsQuery.data;
  const insightsLoading = !insights && !insightsQuery.isError;

  let dialog: ConfirmConfig | null = null;
  if (vendor && action) {
    dialog =
      action === "bypass"
        ? {
            title: `Approve ${vendor.businessName} without verification?`,
            message:
              "This bypasses the CAC registry check (super-admin only) and is recorded in the audit log. Use it only for entities that legitimately have no CAC record, such as government bodies.",
            confirmLabel: "Approve without verification",
            pendingLabel: "Approving…",
            tone: "danger",
            reason: {
              label: "Justification (required, at least 10 characters)",
              placeholder: "e.g. Government entity — National Museum, no CAC on file",
              required: true,
              min: 10,
              max: 500,
            },
          }
        : vendorActionConfig(action, vendor.businessName, vendor.email);
  }

  return (
    <div className="space-y-6">
      {backLink}

      {vendorQuery.isError ? (
        <ErrorBanner
          message={errorMessage(vendorQuery.error, "Couldn't load this vendor.")}
          onRetry={() => void vendorQuery.refetch()}
          retrying={vendorQuery.isFetching}
        />
      ) : null}
      {insightsQuery.isError && !isNotFound(insightsQuery.error) ? (
        <ErrorBanner
          message={`Bookings, ratings and payouts couldn't be loaded: ${errorMessage(insightsQuery.error)}`}
          onRetry={() => void insightsQuery.refetch()}
          retrying={insightsQuery.isFetching}
        />
      ) : null}

      <NoticeBanner notice={notice} onDismiss={clear} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          loading={insightsLoading}
          value={String(insights?.liveListings ?? 0)}
          label={t("admin.vendors.detail.activeListings")}
        />
        <MetricCard
          loading={insightsLoading}
          value={String(insights?.completedBookings ?? 0)}
          label={t("admin.vendors.detail.completedBookings")}
        />
        <MetricCard
          loading={insightsLoading}
          value={insights?.ratingAvg != null ? `${insights.ratingAvg.toFixed(1)} (${insights.reviewCount})` : "—"}
          label={t("admin.vendors.detail.averageRating")}
        />
        <MetricCard loading={insightsLoading} value={String(insights?.openTickets ?? 0)} label="Open support tickets" />
      </div>

      {vendor ? (
        <>
          <VendorProfileHeader vendor={vendor} insights={insights} busy={actionMutation.isPending} onAction={openAction} onNotice={setNotice} />

          {vendor.rejectionReason && vendor.status === "rejected" ? (
            <p className="rounded-lg border border-[#F5C2C2] bg-[#FDEBEB] px-4 py-3 text-sm font-medium font-satoshi text-[#C0392B]">
              Rejection reason: {vendor.rejectionReason}
            </p>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-2">
            <DetailCard title={t("admin.vendors.detail.accountDocuments")}>
              <DetailRow label="CAC registration">
                <span className="flex flex-wrap items-center justify-end gap-2">
                  <span className="text-sm font-semibold text-[#2F2F2F]">{vendor.cacRegistrationNumber?.trim() || "—"}</span>
                  <Badge {...AUTO_CHECK[vendor.cacVerificationStatus]} label={
                    vendor.cacVerificationStatus === "verified" ? "Registry verified" : AUTO_CHECK[vendor.cacVerificationStatus].label
                  } />
                  <button
                    type="button"
                    onClick={() => verifyCacMutation.mutate()}
                    disabled={verifyCacMutation.isPending || !vendor.cacRegistrationNumber}
                    className={`rounded-lg border border-[#E5E5E5] bg-white px-2.5 py-1 text-xs font-bold text-[#135391] hover:bg-[#F5F5F5] disabled:opacity-50 ${focusRing}`}
                  >
                    {verifyCacMutation.isPending ? "Checking…" : vendor.cacVerificationStatus === "unverified" ? "Run check" : "Re-run"}
                  </button>
                </span>
              </DetailRow>
              {vendor.cacVerifiedName ? <DetailRow label="Registry name" value={vendor.cacVerifiedName} /> : null}
              {vendor.documents.length === 0 ? (
                <p className="py-3 text-sm font-medium text-[#676565]">No KYC documents uploaded.</p>
              ) : (
                vendor.documents.map((doc) => (
                  <div key={doc.id} className="border-b border-dotted border-[#E0E0E0] py-3 last:border-b-0">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium font-satoshi text-[#2F2F2F]">{DOC_LABELS[doc.type] ?? prettyType(doc.type)}</p>
                        <p className="truncate text-xs text-[#9E9E9E]">
                          {doc.fileName} · uploaded {formatDate(doc.createdAt)}
                        </p>
                      </div>
                      <Badge {...DOC_STATUS[doc.status]} />
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {doc.fileUrl ? (
                        <button
                          type="button"
                          onClick={() => handleViewDoc(doc.id)}
                          className={`inline-flex items-center gap-1 rounded text-xs font-bold text-[#135391] underline ${focusRing}`}
                        >
                          View file <ExternalLink className="h-3 w-3" aria-hidden />
                        </button>
                      ) : (
                        <span className="text-xs italic text-[#9E9E9E]">No file uploaded</span>
                      )}
                      {doc.type === "government_id" ? (
                        <>
                          <span className="text-xs text-[#676565]">Automated ID check:</span>
                          <Badge {...AUTO_CHECK[doc.verificationStatus ?? "unverified"]} />
                          <button
                            type="button"
                            onClick={() => verifyIdMutation.mutate()}
                            disabled={verifyIdMutation.isPending || !doc.fileUrl}
                            className={`rounded-lg border border-[#E5E5E5] bg-white px-2.5 py-1 text-xs font-bold text-[#135391] hover:bg-[#F5F5F5] disabled:opacity-50 ${focusRing}`}
                          >
                            {verifyIdMutation.isPending ? "Checking…" : "Run ID check"}
                          </button>
                        </>
                      ) : null}
                      {doc.status === "pending" ? (
                        <Link
                          href={`/admin/verifications?doc=${doc.id}`}
                          className={`text-xs font-bold text-[#135391] hover:underline ${focusRing}`}
                        >
                          Review in queue →
                        </Link>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </DetailCard>

            <DetailCard title="Listing documents">
              {insightsLoading ? (
                <SkeletonRows />
              ) : !insights || insights.listingDocuments.length === 0 ? (
                <p className="py-2 text-sm font-medium text-[#676565]">No listing documents uploaded.</p>
              ) : (
                insights.listingDocuments.map((doc) => (
                  <DetailRow key={doc.id} label={`${doc.listingTitle ?? "Listing"} — ${prettyType(doc.type)}`}>
                    <Badge {...DOC_STATUS[doc.status]} />
                  </DetailRow>
                ))
              )}
            </DetailCard>

            <DetailCard title={t("admin.vendors.detail.payoutSummary")}>
              {insightsLoading ? (
                <SkeletonRows />
              ) : (
                <PayoutSummary vendor={vendor} insights={insights} />
              )}
            </DetailCard>

            <DetailCard title="Business details">
              <DetailRow label="Business type" value={vendor.businessType} />
              <DetailRow label="Owner" value={vendor.ownerFullName} />
              <DetailRow label="Date of birth" value={formatDate(vendor.dateOfBirth)} />
              <DetailRow label="Address" value={vendor.businessAddress ?? undefined} />
              <DetailRow label="Phone" value={vendor.phoneNumber ?? undefined} />
              <DetailRow label="Email" value={vendor.email} />
              <DetailRow
                label="Email address"
                value={insights?.emailVerified ? "Verified" : "Not verified"}
                badgeTone={insights?.emailVerified ? "verified" : "notVerified"}
              />
            </DetailCard>
          </div>

          <ListingsCard listings={vendor.listings} />
          <BookingsCard insights={insights} loading={insightsLoading} />
        </>
      ) : !vendorQuery.isError ? (
        <div className="space-y-6" aria-busy="true" aria-label="Loading vendor">
          <div className="rounded-xl border border-[#EEEEEE] bg-white p-6 shadow-sm">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="mt-4 h-4 w-96 max-w-full" />
            <Skeleton className="mt-2 h-4 w-72 max-w-full" />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm">
                <Skeleton className="h-5 w-40" />
                <SkeletonRows />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {dialog && action ? (
        <ConfirmDialog
          key={action}
          config={dialog}
          pending={actionMutation.isPending}
          error={actionMutation.error ? errorMessage(actionMutation.error) : null}
          onClose={() => setAction(null)}
          onConfirm={(reason) => actionMutation.mutate({ kind: action, reason })}
        />
      ) : null}
    </div>
  );
}

function Badge({ label, tone }: { label: string; tone: BadgeTone }) {
  return (
    <span className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${BADGE_STYLES[tone]}`}>
      {label}
    </span>
  );
}

function SkeletonRows() {
  return (
    <div aria-hidden>
      {[0, 1, 2].map((r) => (
        <Skeleton key={r} className="mt-4 h-4 w-full" />
      ))}
    </div>
  );
}

function VendorProfileHeader({
  vendor,
  insights,
  busy,
  onAction,
  onNotice,
}: {
  vendor: AdminVendorDetail;
  insights: AdminVendorInsights | undefined;
  busy: boolean;
  onAction: (kind: ActionKind) => void;
  onNotice: (n: { tone: "success" | "error"; message: string }) => void;
}) {
  const t = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  useDismiss(menuRef, menuOpen, closeMenu);
  const pick = (kind: ActionKind) => () => {
    closeMenu();
    onAction(kind);
  };
  const pendingListings = insights?.pendingListings ?? vendor.listings.filter((l) => l.status === "pending").length;
  const firstPending = vendor.listings.find((l) => l.status === "pending");

  return (
    <div className="rounded-xl border border-[#EEEEEE] bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold font-satoshi text-[#2F2F2F]">{vendor.businessName}</h2>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${VENDOR_STATUS_STYLES[vendor.status]}`}>
              {VENDOR_STATUS_LABELS[vendor.status]}
            </span>
            {vendor.cacVerificationStatus === "verified" ? (
              <span className="rounded-full bg-[#E3F2FD] px-2.5 py-1 text-xs font-semibold text-[#1565C0]">CAC verified</span>
            ) : null}
          </div>

          <p className="mt-3 text-sm font-medium font-satoshi text-[#676565]">
            {t("admin.vendors.detail.category")}: {vendor.businessType} &bull; {t("admin.vendors.vendorId")}:{" "}
            <span title={vendor.id}>{shortId(vendor.id)}</span> &bull;{" "}
            {vendor.reviewedAt && vendor.status !== "pending"
              ? t("admin.vendors.detail.onboarded", { date: formatDate(vendor.reviewedAt) })
              : `Applied ${formatDate(vendor.createdAt)}`}
            {insights?.lastLoginAt ? <> &bull; Last sign-in {formatRelative(insights.lastLoginAt)}</> : null}
          </p>
          <p className="mt-1 break-words text-sm font-medium font-satoshi text-[#676565]">
            {vendor.ownerFullName} &bull; {vendor.email}
            {vendor.phoneNumber ? <> &bull; {vendor.phoneNumber}</> : null}
            {vendor.businessAddress ? <> &bull; {vendor.businessAddress}</> : null}
          </p>

          {vendor.status === "pending" ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => onAction("approve")}
                className={`rounded-lg bg-[#2E7D32] px-4 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-60 ${focusRing}`}
              >
                Approve vendor
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => onAction("reject")}
                className={`rounded-lg border border-[#F5C2C2] bg-white px-4 py-2 text-xs font-bold text-[#C0392B] hover:bg-[#FDEBEB] disabled:opacity-60 ${focusRing}`}
              >
                Reject application
              </button>
              {vendor.cacVerificationStatus !== "verified" ? (
                <p className="basis-full text-xs font-medium text-[#9A7200]">
                  Approval needs a verified CAC registration — run the CAC check under Account documents first.
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div ref={menuRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-label={`Actions for ${vendor.businessName}`}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#676565] transition-colors hover:bg-[#F5F5F5] ${focusRing}`}
          >
            <MoreVertical className="h-4 w-4" aria-hidden />
          </button>

          {menuOpen ? (
            <div
              role="menu"
              className="absolute right-0 top-full z-20 mt-1 w-72 overflow-hidden rounded-lg border border-[#EEEEEE] bg-white py-2 shadow-lg"
            >
              <MenuSection title={t("admin.vendors.menu.verification")}>
                {vendor.status === "pending" ? (
                  <>
                    <MenuItem icon={Check} label="Approve vendor" onClick={pick("approve")} />
                    <MenuItem icon={ShieldAlert} label="Approve without CAC verification" onClick={pick("bypass")} />
                    <MenuItem icon={Ban} label="Reject application" destructive onClick={pick("reject")} />
                  </>
                ) : null}
                <MenuItem
                  icon={List}
                  label={
                    pendingListings > 0
                      ? `${t("admin.vendors.menu.approvePendingListing")} (${pendingListings})`
                      : t("admin.vendors.detail.viewListings")
                  }
                  href={firstPending ? `/admin/listings/${firstPending.id}` : "#vendor-listings"}
                  onClick={closeMenu}
                />
              </MenuSection>
              <MenuDivider />
              <MenuSection title={t("admin.vendors.menu.financial")}>
                <MenuItem icon={Wallet} label="Review payout requests" href="/admin/payouts" onClick={closeMenu} />
              </MenuSection>
              <MenuDivider />
              <MenuSection title={t("admin.vendors.menu.communication")}>
                <MenuItem icon={Mail} label={t("admin.vendors.menu.contactVendor")} href={`mailto:${vendor.email}`} onClick={closeMenu} />
                <MenuItem
                  icon={Copy}
                  label="Copy email address"
                  onClick={() => {
                    closeMenu();
                    void navigator.clipboard
                      ?.writeText(vendor.email)
                      .then(() => onNotice({ tone: "success", message: "Email address copied." }), () => undefined);
                  }}
                />
              </MenuSection>
              {vendor.status === "active" || vendor.status === "suspended" ? (
                <>
                  <MenuDivider />
                  <MenuSection title={t("admin.vendors.menu.account")}>
                    {vendor.status === "active" ? (
                      <MenuItem icon={Power} label={t("admin.vendors.menu.suspendAccount")} destructive onClick={pick("suspend")} />
                    ) : (
                      <MenuItem icon={RotateCcw} label="Reactivate account" onClick={pick("reactivate")} />
                    )}
                  </MenuSection>
                </>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function PayoutSummary({ vendor, insights }: { vendor: AdminVendorDetail; insights: AdminVendorInsights | undefined }) {
  const t = useTranslation();
  const balances = insights?.payouts.balances ?? [];
  const primary = balances[0];
  return (
    <>
      <DetailRow
        label={t("admin.vendors.detail.pendingPayout")}
        value={
          insights && insights.payouts.pendingPayoutCount > 0
            ? `${formatAmounts(balances.filter((b) => b.pendingPayouts > 0).map((b) => ({ currency: b.currency, amount: b.pendingPayouts })))} (${insights.payouts.pendingPayoutCount} request${insights.payouts.pendingPayoutCount === 1 ? "" : "s"})`
            : "None"
        }
      />
      <DetailRow
        label="Available balance"
        value={primary ? formatAmounts(balances.map((b) => ({ currency: b.currency, amount: b.availableBalance }))) : formatMoney(0, "NGN")}
      />
      <DetailRow
        label="Lifetime earnings"
        value={primary ? formatAmounts(balances.map((b) => ({ currency: b.currency, amount: b.lifetimeEarnings }))) : formatMoney(0, "NGN")}
      />
      <DetailRow label="Gross booking value" value={formatAmounts(insights?.revenue ?? [], formatMoney(0, "NGN"))} />
      <DetailRow label={t("admin.vendors.detail.lastPayout")} value={insights?.payouts.lastPayoutAt ? formatDate(insights.payouts.lastPayoutAt) : "No payouts yet"} />
      <DetailRow
        label={t("admin.vendors.commission")}
        value={insights ? t("admin.vendors.commissionValue", { rate: insights.platformSharePercent }) : "—"}
      />
      <DetailRow
        label="Payout account"
        value={
          vendor.payoutAccountNumber
            ? `${vendor.payoutAccountName ?? ""}${vendor.payoutAccountName ? " · " : ""}${vendor.payoutAccountNumber}${vendor.payoutBankId ? ` (${vendor.payoutBankId})` : ""}`
            : "Not set up"
        }
      />
    </>
  );
}

function ListingsCard({ listings }: { listings: AdminListing[] }) {
  return (
    <section id="vendor-listings" className="scroll-mt-24">
      <DetailCard title={`Listings (${listings.length})`}>
        {listings.length === 0 ? (
          <p className="py-2 text-sm font-medium text-[#676565]">No listings yet.</p>
        ) : (
          <ul className="divide-y divide-dotted divide-[#E0E0E0]">
            {listings.map((listing) => (
              <li key={listing.id}>
                <Link
                  href={`/admin/listings/${listing.id}`}
                  className={`flex items-center justify-between gap-3 rounded py-3 hover:bg-[#F8FBFF] ${focusRing}`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold font-satoshi text-[#135391]">{listing.title}</p>
                    <p className="mt-0.5 truncate text-xs font-medium capitalize text-[#676565]">
                      {listing.category} · {listing.location ?? "—"} · added {formatDate(listing.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${LISTING_STATUS_STYLES[listing.status]}`}
                  >
                    {listing.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </DetailCard>
    </section>
  );
}

function BookingsCard({ insights, loading }: { insights: AdminVendorInsights | undefined; loading: boolean }) {
  const bookings = insights?.recentBookings ?? [];
  const byStatus = insights?.bookingsByStatus ?? {};
  const summary = Object.entries(byStatus)
    .filter(([, n]) => n > 0)
    .map(([s, n]) => `${n} ${(BOOKING_STATUS[s]?.label ?? s).toLowerCase()}`)
    .join(" · ");
  return (
    <DetailCard
      title="Recent bookings"
      action={summary ? <span className="hidden text-xs font-medium text-[#676565] sm:inline">{summary}</span> : undefined}
    >
      {loading ? (
        <SkeletonRows />
      ) : bookings.length === 0 ? (
        <p className="py-2 text-sm font-medium text-[#676565]">No bookings yet.</p>
      ) : (
        <div className="-mx-5 max-h-[480px] overflow-auto">
          <table className="w-full min-w-[760px] text-left text-sm font-satoshi">
            <thead className="sticky top-0 bg-[#FAFAFA] text-xs font-semibold uppercase text-[#676565]">
              <tr>
                <th scope="col" className="px-5 py-2.5">Booking</th>
                <th scope="col" className="px-5 py-2.5">Guest</th>
                <th scope="col" className="px-5 py-2.5">Service date</th>
                <th scope="col" className="px-5 py-2.5">Booked</th>
                <th scope="col" className="px-5 py-2.5 text-right">Amount</th>
                <th scope="col" className="px-5 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F0F0]">
              {bookings.map((b) => {
                const st = BOOKING_STATUS[b.status] ?? { label: prettyType(b.status), className: "bg-[#F5F5F5] text-[#676565]" };
                return (
                  <tr key={b.id}>
                    <td className="px-5 py-3">
                      <p className="font-semibold text-[#2F2F2F]">{b.listingTitle}</p>
                      <p className="font-mono text-xs text-[#676565]">{b.bookingReference}</p>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-[#676565]">
                      {b.guestFirstName ?? "Guest"} · {b.guestCount} {b.guestCount === 1 ? "guest" : "guests"}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-[#676565]">
                      {formatDate(b.experienceDate)}
                      {b.checkOutDate ? ` – ${formatDate(b.checkOutDate)}` : ""}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-[#676565]">{formatDate(b.createdAt)}</td>
                    <td className="px-5 py-3 text-right font-semibold whitespace-nowrap text-[#2F2F2F] tabular-nums">
                      {formatMoney(b.amount, b.currency)}
                      {!b.paymentSecured ? <p className="text-[11px] font-medium text-[#9A7200]">Unpaid</p> : null}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${st.className}`}>
                        {st.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </DetailCard>
  );
}
