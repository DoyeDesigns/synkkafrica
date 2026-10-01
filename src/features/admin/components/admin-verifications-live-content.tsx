"use client";

import Link from "next/link";
import { Check, Clock, CreditCard, ExternalLink, FileText, Home, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  adminApproveBusinessDoc,
  adminBusinessDocViewUrl,
  adminRejectBusinessDoc,
  adminVerifyVendorCac,
  adminVerifyVendorId,
  type VerificationStatus,
} from "@/lib/api/admin";
import { adminGetVerificationQueue, type AdminVerificationDoc } from "@/lib/api/admin/vendor-insights";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";
import { LIVE_QUERY_OPTIONS } from "@/lib/live-query-options";
import {
  ConfirmDialog,
  EmptyState,
  ErrorBanner,
  FilterChips,
  NoticeBanner,
  Pagination,
  SearchBox,
  Skeleton,
  errorMessage,
  focusRing,
  formatDate,
  formatMinutes,
  paginate,
  shortId,
  useNotice,
  useUrlSearch,
  useUrlState,
  type ConfirmConfig,
} from "@/features/admin/components/admin-people-kit";

const STATUS_FILTERS = ["all", "pending", "approved", "rejected"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];
type DocStatus = AdminVerificationDoc["status"];

const STATUS_LABEL_KEYS: Record<DocStatus, TranslationKey> = {
  pending: "admin.verifications.status.pendingReview",
  approved: "admin.verifications.status.approved",
  rejected: "admin.verifications.status.denied",
};

const STATUS_BADGE_STYLES: Record<DocStatus, string> = {
  pending: "bg-[#FFF3E0] text-[#E65100]",
  approved: "bg-[#E8F5E9] text-[#2E7D32]",
  rejected: "bg-[#FDEBEB] text-[#C0392B]",
};

const DOC_LABELS: Record<string, string> = {
  government_id: "Government ID",
  cac_certificate: "CAC certificate",
  proof_of_address: "Proof of address",
};

const DOC_ICONS: Record<string, typeof FileText> = {
  government_id: CreditCard,
  cac_certificate: FileText,
  proof_of_address: Home,
};

const CHECK_STYLES: Record<VerificationStatus, string> = {
  verified: "text-[#2E7D32]",
  failed: "text-[#C0392B]",
  unverified: "text-[#676565]",
};

function docLabel(type: string) {
  return DOC_LABELS[type] ?? type.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

function elapsedSince(iso: string): string {
  return formatMinutes(Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60000)));
}

type Decision = "approve" | "reject";

export function AdminVerificationsLiveContent() {
  const t = useTranslation();
  const { data: session } = useSession();
  const token = session?.accessToken;
  const queryClient = useQueryClient();
  const { get, set } = useUrlState();
  const search = useUrlSearch("q");
  const { notice, setNotice, clear } = useNotice();
  const [decision, setDecision] = useState<{ kind: Decision; doc: AdminVerificationDoc } | null>(null);

  const statusParam = get("status", "pending");
  const status: StatusFilter = (STATUS_FILTERS as readonly string[]).includes(statusParam)
    ? (statusParam as StatusFilter)
    : "pending";
  const selectedId = get("doc");

  const query = useQuery({
    queryKey: ["admin-verification-queue"],
    queryFn: () => adminGetVerificationQueue(token as string),
    enabled: Boolean(token),
    ...LIVE_QUERY_OPTIONS,
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin-verification-queue"] });
    await queryClient.invalidateQueries({ queryKey: ["admin-business-docs"] });
    await queryClient.invalidateQueries({ queryKey: ["admin-vendor"] });
    await queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
  };

  const decide = useMutation({
    mutationFn: (v: { kind: Decision; doc: AdminVerificationDoc }) =>
      v.kind === "approve"
        ? adminApproveBusinessDoc(token as string, v.doc.id)
        : adminRejectBusinessDoc(token as string, v.doc.id),
    onSuccess: async (_r, v) => {
      setDecision(null);
      setNotice({
        tone: "success",
        message:
          v.kind === "approve"
            ? `${docLabel(v.doc.type)} for ${v.doc.businessName} approved. The vendor has been notified.`
            : `${docLabel(v.doc.type)} for ${v.doc.businessName} denied. The vendor has been asked to re-upload it.`,
      });
      await invalidate();
    },
  });

  const docs = useMemo(() => query.data?.documents ?? [], [query.data]);
  const counts = useMemo(() => {
    const c: Record<StatusFilter, number> = { all: docs.length, pending: 0, approved: 0, rejected: 0 };
    for (const d of docs) c[d.status] += 1;
    return c;
  }, [docs]);

  const filtered = useMemo(() => {
    const q = search.term;
    return docs.filter((d) => {
      if (status !== "all" && d.status !== status) return false;
      if (!q) return true;
      return (
        d.businessName.toLowerCase().includes(q) ||
        d.ownerFullName.toLowerCase().includes(q) ||
        d.email.toLowerCase().includes(q) ||
        docLabel(d.type).toLowerCase().includes(q) ||
        d.vendorId.toLowerCase().startsWith(q) ||
        shortId(d.vendorId).toLowerCase().startsWith(q)
      );
    });
  }, [docs, search.term, status]);

  const pagination = paginate(filtered, get("page", "1"));
  const selected = filtered.find((d) => d.id === selectedId) ?? docs.find((d) => d.id === selectedId) ?? pagination.items[0];

  // Keep the selection in the URL so a refresh / shared link opens the same
  // document. Only fill it in when nothing valid is selected.
  useEffect(() => {
    if (!query.data) return;
    if (selected && selected.id !== selectedId) set({ doc: selected.id });
  }, [query.data, selected, selectedId, set]);

  const hasFilters = Boolean(search.term) || status !== "pending";
  const loading = query.isLoading || (!token && !query.data);
  const stats = query.data?.stats;

  const confirmConfig: ConfirmConfig | null = decision
    ? decision.kind === "approve"
      ? {
          title: `Approve ${docLabel(decision.doc.type).toLowerCase()}?`,
          message: `Mark ${decision.doc.businessName}'s ${docLabel(decision.doc.type).toLowerCase()} as verified. ${decision.doc.ownerFullName} will be notified.`,
          confirmLabel: t("admin.verifications.approve"),
          pendingLabel: "Approving…",
          tone: "success",
        }
      : {
          title: decision.doc.status === "approved" ? "Revoke this approval?" : `Deny ${docLabel(decision.doc.type).toLowerCase()}?`,
          message: `${decision.doc.businessName}'s ${docLabel(decision.doc.type).toLowerCase()} will be marked rejected and ${decision.doc.ownerFullName} will be asked to upload it again.`,
          confirmLabel: decision.doc.status === "approved" ? t("admin.verifications.revokeApproval") : t("admin.verifications.deny"),
          pendingLabel: "Saving…",
          tone: "danger",
        }
    : null;

  return (
    <>
      <div>
        <h2 className="text-lg font-bold font-satoshi text-[#2F2F2F]">{t("admin.verifications.title")}</h2>
        <p className="mt-1 max-w-3xl text-sm font-medium font-satoshi text-[#676565]">
          Vendor KYC documents — government ID, CAC certificate and proof of address. Automated checks run through
          Dojah; everything lands here for a final human decision.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("admin.verifications.stats.needsManualReview")}
          value={stats ? String(stats.pending) : null}
          className="text-[#E65100]"
        />
        <StatCard
          label={t("admin.verifications.stats.approvedToday")}
          value={stats ? String(stats.approvedToday) : null}
          className="text-[#2E7D32]"
        />
        <StatCard
          label={t("admin.verifications.stats.deniedToday")}
          value={stats ? String(stats.rejectedToday) : null}
          className="text-[#C0392B]"
        />
        <StatCard
          label={`${t("admin.verifications.stats.avgReviewTime")} (30 days)`}
          value={stats ? (stats.avgReviewMinutes === null ? "—" : formatMinutes(stats.avgReviewMinutes)) : null}
          className="text-[#135391]"
        />
      </div>

      <NoticeBanner notice={notice} onDismiss={clear} />

      {query.isError ? (
        <ErrorBanner
          message={errorMessage(query.error, "Couldn't load the verification queue.")}
          onRetry={() => void query.refetch()}
          retrying={query.isFetching}
        />
      ) : null}

      <SearchBox
        value={search.input}
        onChange={search.setInput}
        label="Search verifications"
        placeholder="Search by business, owner, email, document or vendor ID…"
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterChips
          label="Filter by review status"
          options={[
            { value: "pending", label: t("admin.verifications.status.pendingReview") },
            { value: "approved", label: t("admin.verifications.status.approved") },
            { value: "rejected", label: t("admin.verifications.status.denied") },
            { value: "all", label: t("admin.common.all") },
          ]}
          value={status}
          counts={loading ? undefined : counts}
          onChange={(v) => set({ status: v === "pending" ? null : v, page: null, doc: null })}
        />
        <p className="text-sm font-medium font-satoshi text-[#676565]" aria-live="polite">
          {loading ? "Loading documents…" : `${filtered.length} ${filtered.length === 1 ? "document" : "documents"}`}
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="rounded-xl border border-[#EEEEEE] bg-white p-4" aria-hidden>
                <Skeleton className="h-4 w-16" />
                <Skeleton className="mt-3 h-5 w-48" />
                <Skeleton className="mt-2 h-4 w-64 max-w-full" />
              </div>
            ))
          ) : pagination.items.length > 0 ? (
            <ul className="space-y-3" aria-label="Verification submissions">
              {pagination.items.map((doc) => (
                <li key={doc.id}>
                  <VerificationListItem
                    doc={doc}
                    isSelected={selected?.id === doc.id}
                    onSelect={() => set({ doc: doc.id })}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-xl border border-[#EEEEEE] bg-[#FAFAFA]">
              <EmptyState
                message={
                  hasFilters
                    ? status === "pending" && !search.term
                      ? "Nothing waiting for review — the queue is clear."
                      : t("admin.verifications.empty")
                    : "No documents uploaded yet."
                }
                actionLabel={search.term || status !== "pending" ? "Clear search and filters" : undefined}
                onAction={() => {
                  search.setInput("");
                  set({ q: null, status: null, page: null, doc: null });
                }}
              />
            </div>
          )}

          {pagination.totalPages > 1 ? (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={(page) => set({ page: page === 1 ? null : page, doc: null })}
              label={`Page ${pagination.currentPage} of ${pagination.totalPages}`}
            />
          ) : null}
        </div>

        {selected ? (
          <VerificationDetailPanel
            key={selected.id}
            doc={selected}
            busy={decide.isPending}
            onDecide={(kind) => {
              decide.reset();
              clear();
              setDecision({ kind, doc: selected });
            }}
            onNotice={setNotice}
            onChanged={invalidate}
          />
        ) : null}
      </div>

      {decision && confirmConfig ? (
        <ConfirmDialog
          key={`${decision.kind}-${decision.doc.id}`}
          config={confirmConfig}
          pending={decide.isPending}
          error={decide.error ? errorMessage(decide.error) : null}
          onClose={() => setDecision(null)}
          onConfirm={() => decide.mutate(decision)}
        />
      ) : null}
    </>
  );
}

function StatCard({ label, value, className }: { label: string; value: string | null; className: string }) {
  return (
    <div className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm">
      <p className="text-sm font-medium font-satoshi text-[#676565]">{label}</p>
      {value === null ? (
        <Skeleton className="mt-3 h-8 w-16" />
      ) : (
        <p className={`mt-2 text-3xl font-bold font-inter ${className}`}>{value}</p>
      )}
    </div>
  );
}

function VerificationListItem({
  doc,
  isSelected,
  onSelect,
}: {
  doc: AdminVerificationDoc;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const t = useTranslation();
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={`w-full rounded-xl border p-4 text-left transition-colors ${focusRing} ${
        isSelected ? "border-[#135391] bg-[#F0F6FC]" : "border-[#EEEEEE] bg-white hover:bg-[#FAFAFA]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className="inline-flex rounded bg-[#F3E5F5] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#7B1FA2]">
            {t("admin.verifications.audience.vendor")}
          </span>
          <p className="mt-2 font-bold font-satoshi text-[#2F2F2F]">{doc.businessName}</p>
          <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
            {docLabel(doc.type)} · {t("admin.verifications.submitted", { date: formatDate(doc.createdAt) })}
          </p>
          {doc.status === "pending" ? (
            <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold font-satoshi text-[#C0392B]">
              <Clock className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
              {t("admin.verifications.pendingElapsed", { elapsed: elapsedSince(doc.createdAt) })}
              {doc.vendorStatus === "pending" ? " — blocking vendor approval" : ""}
            </p>
          ) : null}
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_BADGE_STYLES[doc.status]}`}>
          {t(STATUS_LABEL_KEYS[doc.status])}
        </span>
      </div>
    </button>
  );
}

function VerificationDetailPanel({
  doc,
  busy,
  onDecide,
  onNotice,
  onChanged,
}: {
  doc: AdminVerificationDoc;
  busy: boolean;
  onDecide: (kind: Decision) => void;
  onNotice: (n: { tone: "success" | "error"; message: string }) => void;
  onChanged: () => Promise<void>;
}) {
  const t = useTranslation();
  const { data: session } = useSession();
  const token = session?.accessToken;
  const Icon = DOC_ICONS[doc.type] ?? FileText;
  const [opening, setOpening] = useState(false);

  const recheck = useMutation({
    mutationFn: () =>
      doc.type === "government_id"
        ? adminVerifyVendorId(token as string, doc.vendorId).then((r) => r.verificationStatus)
        : adminVerifyVendorCac(token as string, doc.vendorId).then((r) => r.cacVerificationStatus),
    onSuccess: async (result) => {
      onNotice({
        tone: result === "verified" ? "success" : "error",
        message: result === "verified" ? "Automated check passed." : "Automated check ran but did not pass.",
      });
      await onChanged();
    },
    onError: (err) => onNotice({ tone: "error", message: `Automated check failed to run: ${errorMessage(err)}` }),
  });

  const openDocument = () => {
    const win = window.open("", "_blank");
    setOpening(true);
    adminBusinessDocViewUrl(token as string, doc.id)
      .then(({ url }) => {
        if (win) win.location.href = url;
      })
      .catch((err: unknown) => {
        win?.close();
        onNotice({ tone: "error", message: `Couldn't open the document: ${errorMessage(err)}` });
      })
      .finally(() => setOpening(false));
  };

  const reviewedIn =
    doc.reviewedAt && doc.status !== "pending"
      ? formatMinutes(Math.max(0, Math.round((Date.parse(doc.reviewedAt) - Date.parse(doc.createdAt)) / 60000)))
      : null;

  const checks: Array<{ label: string; result: string; tone: VerificationStatus }> = [];
  if (doc.type === "government_id") {
    checks.push({
      label: "Document analysis (Dojah)",
      result:
        doc.verificationStatus === "verified"
          ? `${t("admin.verifications.checkResult.passed")}${doc.verifiedAt ? ` · ${formatDate(doc.verifiedAt)}` : ""}`
          : doc.verificationStatus === "failed"
            ? t("admin.verifications.checkResult.failed")
            : "Not run yet",
      tone: doc.verificationStatus,
    });
  }
  checks.push({
    label: t("admin.verifications.check.cacRegistrationLookup"),
    result: !doc.cacRegistrationNumber
      ? "No CAC number on file"
      : doc.cacVerificationStatus === "verified"
        ? `${t("admin.verifications.check.cacRegistrationVerified")} · RC ${doc.cacRegistrationNumber}`
        : doc.cacVerificationStatus === "failed"
          ? `${t("admin.verifications.checkResult.failed")} · RC ${doc.cacRegistrationNumber}`
          : `Not run yet · RC ${doc.cacRegistrationNumber}`,
    tone: doc.cacRegistrationNumber ? doc.cacVerificationStatus : "unverified",
  });
  if (doc.cacVerifiedName) {
    const match = doc.cacVerifiedName.trim().toLowerCase() === doc.businessName.trim().toLowerCase();
    checks.push({
      label: t("admin.verifications.check.nameMatch"),
      result: match ? t("admin.verifications.check.nameMatchDetail") : `Registry: "${doc.cacVerifiedName}"`,
      tone: match ? "verified" : "failed",
    });
  }
  const canRecheck = doc.type === "government_id" ? doc.hasFile : doc.type === "cac_certificate" && Boolean(doc.cacRegistrationNumber);

  const decideBtn = `rounded-lg px-4 py-3 text-sm font-bold font-satoshi transition-colors disabled:opacity-60 ${focusRing}`;

  return (
    <section className="h-fit rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm xl:sticky xl:top-4" aria-label="Selected document">
      <div>
        <h3 className="text-lg font-bold font-satoshi text-[#2F2F2F]">{doc.businessName}</h3>
        <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
          {t("admin.verifications.audience.vendor")} · {doc.ownerFullName} ·{" "}
          {t("admin.verifications.accountId", { id: shortId(doc.vendorId) })}{" "}
          <Link
            href={`/admin/vendors/${doc.vendorId}`}
            className={`font-semibold text-[#135391] underline underline-offset-2 ${focusRing}`}
          >
            {t("admin.verifications.viewAccount")}
          </Link>
        </p>
        <p className="mt-0.5 break-all text-xs text-[#9E9E9E]">
          {doc.email}
          {doc.phoneNumber ? ` · ${doc.phoneNumber}` : ""}
        </p>
      </div>

      {doc.status === "pending" ? (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-[#FFF3E0] bg-[#FFF9F0] px-4 py-3">
          <p className="text-sm font-semibold font-satoshi text-[#E65100]">{t("admin.verifications.pendingManualReview")}</p>
          <p className="shrink-0 text-sm font-medium font-satoshi text-[#E65100]">
            {t("admin.verifications.elapsed", { elapsed: elapsedSince(doc.createdAt) })}
          </p>
        </div>
      ) : doc.status === "approved" ? (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-[#C8E6C9] bg-[#E8F5E9] px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-semibold font-satoshi text-[#2E7D32]">
            <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
            {t("admin.verifications.verificationApproved")}
          </p>
          {reviewedIn ? (
            <p className="shrink-0 text-sm font-medium font-satoshi text-[#2E7D32]">
              {t("admin.verifications.reviewedInElapsed", { elapsed: reviewedIn })}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-[#FFCDD2] bg-[#FDEBEB] px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-semibold font-satoshi text-[#C0392B]">
            <X className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
            {t("admin.verifications.verificationDenied")}
          </p>
          {reviewedIn ? (
            <p className="shrink-0 text-sm font-medium font-satoshi text-[#C0392B]">
              {t("admin.verifications.reviewedInElapsed", { elapsed: reviewedIn })}
            </p>
          ) : null}
        </div>
      )}

      <div className="mt-5">
        <div className="flex aspect-[4/3] max-h-64 w-full flex-col items-center justify-center gap-3 rounded-lg border border-[#E8E8E8] bg-[#FAFAFA] px-4 text-center">
          <Icon className="h-8 w-8 text-[#BDBDBD]" strokeWidth={1.5} aria-hidden />
          <p className="text-sm font-medium font-satoshi text-[#2F2F2F]">{docLabel(doc.type)}</p>
          <p className="max-w-full truncate text-xs text-[#676565]">{doc.fileName}</p>
          {doc.hasFile ? (
            <button
              type="button"
              onClick={openDocument}
              disabled={opening}
              className={`inline-flex items-center gap-1.5 rounded-lg border border-[#135391] bg-white px-3 py-1.5 text-xs font-bold text-[#135391] hover:bg-[#F0F6FC] disabled:opacity-60 ${focusRing}`}
            >
              {opening ? "Opening…" : "Open document"}
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </button>
          ) : (
            <p className="text-xs italic text-[#9E9E9E]">No file uploaded yet</p>
          )}
        </div>
        <p className="mt-2 text-center text-xs font-medium font-satoshi text-[#676565]">
          {t("admin.verifications.documentViewLogged")}
        </p>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-bold uppercase tracking-wide font-satoshi text-[#9E9E9E]">Automated checks — Dojah</p>
          {canRecheck ? (
            <button
              type="button"
              onClick={() => recheck.mutate()}
              disabled={recheck.isPending}
              className={`rounded-lg border border-[#E5E5E5] bg-white px-2.5 py-1 text-xs font-bold text-[#135391] hover:bg-[#F5F5F5] disabled:opacity-50 ${focusRing}`}
            >
              {recheck.isPending ? "Running…" : "Re-run check"}
            </button>
          ) : null}
        </div>
        <ul className="mt-3 divide-y divide-[#F0F0F0]">
          {checks.map((check) => (
            <li key={check.label} className="flex flex-wrap items-baseline justify-between gap-2 py-3 first:pt-0 last:pb-0">
              <span className="text-sm font-medium font-satoshi text-[#676565]">{check.label}</span>
              <span className={`text-sm font-bold font-satoshi ${CHECK_STYLES[check.tone]}`}>{check.result}</span>
            </li>
          ))}
          {doc.reviewedAt && doc.status !== "pending" ? (
            <li className="flex flex-wrap items-baseline justify-between gap-2 py-3">
              <span className="text-sm font-medium font-satoshi text-[#676565]">
                {doc.status === "approved" ? t("admin.verifications.approvedBy") : "Denied"}
              </span>
              <span className="text-sm font-bold font-satoshi text-[#2F2F2F]">
                {t("admin.verifications.approvedByValue", { date: formatDate(doc.reviewedAt) })}
              </span>
            </li>
          ) : null}
        </ul>
      </div>

      {doc.status === "pending" ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => onDecide("approve")}
            className={`${decideBtn} bg-[#2E7D32] text-white hover:opacity-90`}
          >
            {t("admin.verifications.approve")}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onDecide("reject")}
            className={`${decideBtn} border border-[#C0392B] bg-white text-[#C0392B] hover:bg-[#FDEBEB]`}
          >
            {t("admin.verifications.deny")} &amp; request re-upload
          </button>
        </div>
      ) : doc.status === "approved" ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => onDecide("reject")}
          className={`${decideBtn} mt-6 w-full border border-[#2F2F2F] bg-white text-[#2F2F2F] hover:bg-[#FAFAFA]`}
        >
          {t("admin.verifications.revokeApproval")}
        </button>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => onDecide("approve")}
          className={`${decideBtn} mt-6 w-full border border-[#2E7D32] bg-white text-[#2E7D32] hover:bg-[#E8F5E9]`}
        >
          Approve instead
        </button>
      )}
      <p className="mt-3 text-center text-xs font-medium text-[#676565]">The vendor is notified of every decision automatically.</p>
    </section>
  );
}
