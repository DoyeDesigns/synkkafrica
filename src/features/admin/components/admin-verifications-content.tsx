"use client";

import { Bell, Check, Clock, CreditCard, FileText, Search, Smartphone, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  ADMIN_VERIFICATION_STATS,
  ADMIN_VERIFICATIONS,
  VERIFICATION_LIST_FILTERS,
  filterAdminVerifications,
  formatVerificationSubmittedAt,
  formatVerificationReviewedAt,
  type AdminVerification,
  type VerificationCheckResult,
  type VerificationListFilter,
  type VerificationStatus,
} from "@/features/admin/data/admin-verifications";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

const LIST_FILTER_LABEL_KEYS: Record<VerificationListFilter, TranslationKey> = {
  all: "admin.common.all",
  users: "admin.verifications.filter.users",
  vendors: "admin.verifications.filter.vendors",
  pending: "admin.verifications.status.pendingReview",
  approved: "admin.verifications.status.approved",
  denied: "admin.verifications.status.denied",
};

const STATUS_LABEL_KEYS: Record<VerificationStatus, TranslationKey> = {
  pending: "admin.verifications.status.pendingReview",
  approved: "admin.verifications.status.approved",
  denied: "admin.verifications.status.denied",
};

const STATUS_BADGE_STYLES: Record<VerificationStatus, string> = {
  pending: "bg-[#FFF3E0] text-[#E65100]",
  approved: "bg-[#E8F5E9] text-[#2E7D32]",
  denied: "bg-[#FDEBEB] text-[#C0392B]",
};

const CHECK_RESULT_STYLES: Record<VerificationCheckResult, string> = {
  passed: "text-[#2E7D32]",
  failed: "text-[#C0392B]",
  warning: "text-[#E65100]",
};

const CHECK_RESULT_LABEL_KEYS: Record<VerificationCheckResult, TranslationKey> =
  {
    passed: "admin.verifications.checkResult.passed",
    failed: "admin.verifications.checkResult.failed",
    warning: "admin.verifications.checkResult.warning",
  };

type StatCardProps = {
  labelKey: TranslationKey;
  value: string;
  valueClassName: string;
};

function StatCard({ labelKey, value, valueClassName }: StatCardProps) {
  const t = useTranslation();

  return (
    <div className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm">
      <p className="text-sm font-medium font-satoshi text-[#676565]">
        {t(labelKey)}
      </p>
      <p className={`mt-2 text-3xl font-bold font-inter ${valueClassName}`}>
        {value}
      </p>
    </div>
  );
}

export function AdminVerificationsContent() {
  const t = useTranslation();
  const [verifications, setVerifications] = useState(ADMIN_VERIFICATIONS);
  const [listFilter, setListFilter] = useState<VerificationListFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>("ver-1");

  const filtered = useMemo(
    () => filterAdminVerifications(verifications, listFilter, searchQuery),
    [listFilter, searchQuery, verifications],
  );

  useEffect(() => {
    setSelectedId((current) => {
      if (current && filtered.some((item) => item.id === current)) {
        return current;
      }

      return filtered[0]?.id ?? null;
    });
  }, [filtered]);

  const selected = verifications.find((item) => item.id === selectedId);

  const updateStatus = (id: string, status: VerificationStatus) => {
    setVerifications((current) =>
      current.map((item) => {
        if (item.id !== id) {
          return item;
        }

        if (status === "pending") {
          return {
            ...item,
            status,
            pendingElapsed: item.pendingElapsed ?? "Just now",
            approvedByAt: undefined,
            denialReasonKey: undefined,
            reviewedElapsed: undefined,
          };
        }

        if (status === "approved") {
          return {
            ...item,
            status,
            pendingElapsed: undefined,
            blockingMessageKey: undefined,
            reviewedElapsed: item.reviewedElapsed ?? "24 min",
            approvedByAt: item.approvedByAt ?? new Date().toISOString(),
            denialReasonKey: undefined,
          };
        }

        return {
          ...item,
          status,
          pendingElapsed: undefined,
          blockingMessageKey: undefined,
          reviewedElapsed: item.reviewedElapsed ?? "51 min",
          approvedByAt: undefined,
          denialReasonKey:
            item.denialReasonKey ??
            "admin.verifications.denialReason.expiredLicense",
        };
      }),
    );
  };

  return (
    <>
      <div>
        <h2 className="text-lg font-bold font-satoshi text-[#2F2F2F]">
          {t("admin.verifications.title")}
        </h2>
        <p className="mt-1 max-w-3xl text-sm font-medium font-satoshi text-[#676565]">
          {t("admin.verifications.subtitle")}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          labelKey="admin.verifications.stats.needsManualReview"
          value={String(ADMIN_VERIFICATION_STATS.needsManualReview)}
          valueClassName="text-[#E65100]"
        />
        <StatCard
          labelKey="admin.verifications.stats.approvedToday"
          value={String(ADMIN_VERIFICATION_STATS.approvedToday)}
          valueClassName="text-[#2E7D32]"
        />
        <StatCard
          labelKey="admin.verifications.stats.deniedToday"
          value={String(ADMIN_VERIFICATION_STATS.deniedToday)}
          valueClassName="text-[#C0392B]"
        />
        <StatCard
          labelKey="admin.verifications.stats.avgReviewTime"
          value={t("admin.verifications.stats.avgReviewTimeValue", {
            minutes: ADMIN_VERIFICATION_STATS.avgReviewTimeMinutes,
          })}
          valueClassName="text-[#135391]"
        />
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]" />
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder={t("admin.verifications.searchPlaceholder")}
          className="h-11 w-full rounded-full border border-[#E5E5E5] bg-white pl-11 pr-4 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none transition-colors focus:border-[#135391]"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {VERIFICATION_LIST_FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setListFilter(filter)}
            className={`rounded-full border px-4 py-2 text-xs font-semibold font-satoshi transition-colors ${
              listFilter === filter
                ? "border-[#2F2F2F] bg-[#2F2F2F] text-white"
                : "border-[#E5E5E5] bg-white text-[#676565] hover:bg-[#FAFAFA]"
            }`}
          >
            {t(LIST_FILTER_LABEL_KEYS[filter])}
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="space-y-3">
          {filtered.length > 0 ? (
            filtered.map((verification) => (
              <VerificationListItem
                key={verification.id}
                verification={verification}
                isSelected={selectedId === verification.id}
                onSelect={() => setSelectedId(verification.id)}
              />
            ))
          ) : (
            <div className="rounded-xl border border-[#EEEEEE] bg-[#FAFAFA] p-10 text-center">
              <p className="text-sm font-medium font-satoshi text-[#676565]">
                {t("admin.verifications.empty")}
              </p>
            </div>
          )}
        </div>

        {selected ? (
          <VerificationDetailPanel
            verification={selected}
            onApprove={() => updateStatus(selected.id, "approved")}
            onDeny={() => updateStatus(selected.id, "denied")}
            onRequestResubmission={() => updateStatus(selected.id, "pending")}
            onRevokeApproval={() => updateStatus(selected.id, "pending")}
          />
        ) : null}
      </div>
    </>
  );
}

function VerificationListItem({
  verification,
  isSelected,
  onSelect,
}: {
  verification: AdminVerification;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const t = useTranslation();

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-xl border p-4 text-left transition-colors ${
        isSelected
          ? "border-[#135391] bg-[#F0F6FC]"
          : "border-[#EEEEEE] bg-white hover:bg-[#FAFAFA]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span
            className={`inline-flex rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
              verification.audience === "user"
                ? "bg-[#E3F2FD] text-[#1565C0]"
                : "bg-[#F3E5F5] text-[#7B1FA2]"
            }`}
          >
            {verification.audience === "user"
              ? t("admin.verifications.audience.user")
              : t("admin.verifications.audience.vendor")}
          </span>

          <p className="mt-2 font-bold font-satoshi text-[#2F2F2F]">
            {verification.name}
          </p>
          <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
            {t(verification.documentTypeKey)} ·{" "}
            {t("admin.verifications.submitted", {
              date: formatVerificationSubmittedAt(verification.submittedAt),
            })}
          </p>

          {verification.status === "pending" && verification.pendingElapsed ? (
            <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold font-satoshi text-[#C0392B]">
              <Clock className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
              {t("admin.verifications.pendingElapsed", {
                elapsed: verification.pendingElapsed,
              })}
              {verification.blockingMessageKey
                ? ` — ${t(verification.blockingMessageKey)}`
                : ""}
            </p>
          ) : null}
        </div>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_BADGE_STYLES[verification.status]}`}
        >
          {t(STATUS_LABEL_KEYS[verification.status])}
        </span>
      </div>
    </button>
  );
}

function VerificationDetailPanel({
  verification,
  onApprove,
  onDeny,
  onRequestResubmission,
  onRevokeApproval,
}: {
  verification: AdminVerification;
  onApprove: () => void;
  onDeny: () => void;
  onRequestResubmission: () => void;
  onRevokeApproval: () => void;
}) {
  const t = useTranslation();

  return (
    <section className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm">
      <div>
        <h3 className="text-lg font-bold font-satoshi text-[#2F2F2F]">
          {verification.name}
        </h3>
        <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
          {verification.audience === "user"
            ? t("admin.verifications.audience.user")
            : t("admin.verifications.audience.vendor")}{" "}
          · {t("admin.verifications.accountId", { id: verification.accountId })}{" "}
          <Link
            href={verification.accountHref}
            className="font-semibold text-[#135391] underline underline-offset-2"
          >
            {t("admin.verifications.viewAccount")}
          </Link>
        </p>
      </div>

      <VerificationStatusBanner verification={verification} />

      <div className="mt-5">
        <div className="grid gap-3 sm:grid-cols-2">
          {verification.documentPreviews.map((document) => (
            <DocumentPreviewCard key={document.id} labelKey={document.labelKey} />
          ))}
        </div>
        <p className="mt-2 text-center text-xs font-medium font-satoshi text-[#676565]">
          {t("admin.verifications.documentViewLogged")}
        </p>
      </div>

      <div className="mt-5">
        <p className="text-[11px] font-bold uppercase tracking-wide font-satoshi text-[#9E9E9E]">
          {t("admin.verifications.providerResultsHeading")}
        </p>
        <ul className="mt-3 divide-y divide-[#F0F0F0]">
          {verification.providerResults.map((check) => (
            <li
              key={check.id}
              className="flex flex-wrap items-baseline justify-between gap-2 py-3 first:pt-0 last:pb-0"
            >
              <span className="text-sm font-medium font-satoshi text-[#676565]">
                {t(check.labelKey)}
              </span>
              <span
                className={`text-sm font-bold font-satoshi ${CHECK_RESULT_STYLES[check.result]}`}
              >
                {check.detailKey
                  ? t(check.detailKey)
                  : t(CHECK_RESULT_LABEL_KEYS[check.result])}
              </span>
            </li>
          ))}

          {verification.status === "approved" && verification.approvedByAt ? (
            <li className="flex flex-wrap items-baseline justify-between gap-2 py-3">
              <span className="text-sm font-medium font-satoshi text-[#676565]">
                {t("admin.verifications.approvedBy")}
              </span>
              <span className="text-sm font-bold font-satoshi text-[#2F2F2F]">
                {t("admin.verifications.approvedByValue", {
                  date: formatVerificationReviewedAt(verification.approvedByAt),
                })}
              </span>
            </li>
          ) : null}
        </ul>
      </div>

      {verification.status === "denied" && verification.denialReasonKey ? (
        <div className="mt-5 rounded-lg border border-[#FFCDD2] bg-[#FFF5F5] px-4 py-4">
          <p className="text-[11px] font-bold uppercase tracking-wide font-satoshi text-[#C0392B]">
            {t("admin.verifications.reasonForDenial")}
          </p>
          <p className="mt-2 text-sm font-medium font-satoshi leading-relaxed text-[#2F2F2F]">
            {t(verification.denialReasonKey)}
          </p>
        </div>
      ) : null}

      {verification.status === "pending" ? (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={onApprove}
              className="rounded-lg bg-[#2E7D32] px-4 py-3 text-sm font-bold font-satoshi text-white transition-opacity hover:opacity-90"
            >
              {t("admin.verifications.approve")}
            </button>
            <button
              type="button"
              onClick={onDeny}
              className="rounded-lg border border-[#C0392B] bg-white px-4 py-3 text-sm font-bold font-satoshi text-[#C0392B] transition-colors hover:bg-[#FDEBEB]"
            >
              {t("admin.verifications.deny")}
            </button>
            <button
              type="button"
              onClick={onRequestResubmission}
              className="rounded-lg border border-[#E65100] bg-white px-4 py-3 text-sm font-bold font-satoshi text-[#E65100] transition-colors hover:bg-[#FFF3E0]"
            >
              {t("admin.verifications.requestResubmission")}
            </button>
          </div>

          <button
            type="button"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#135391] px-4 py-3 text-sm font-bold font-satoshi text-white transition-opacity hover:opacity-90"
          >
            <Bell className="h-4 w-4" strokeWidth={2} />
            {verification.audience === "vendor"
              ? t("admin.verifications.notifyVendor")
              : t("admin.verifications.notifyUser")}
          </button>
        </>
      ) : null}

      {verification.status === "approved" ? (
        <>
          <button
            type="button"
            onClick={onRevokeApproval}
            className="mt-6 w-full rounded-lg border border-[#2F2F2F] bg-white px-4 py-3 text-sm font-bold font-satoshi text-[#2F2F2F] transition-colors hover:bg-[#FAFAFA]"
          >
            {t("admin.verifications.revokeApproval")}
          </button>
          <button
            type="button"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#135391] px-4 py-3 text-sm font-bold font-satoshi text-white transition-opacity hover:opacity-90"
          >
            <Bell className="h-4 w-4" strokeWidth={2} />
            {verification.audience === "vendor"
              ? t("admin.verifications.notifyVendor")
              : t("admin.verifications.notifyUser")}
          </button>
        </>
      ) : null}

      {verification.status === "denied" ? (
        <>
          <button
            type="button"
            onClick={onRequestResubmission}
            className="mt-6 w-full rounded-lg border border-[#E65100] bg-white px-4 py-3 text-sm font-bold font-satoshi text-[#E65100] transition-colors hover:bg-[#FFF3E0]"
          >
            {t("admin.verifications.inviteResubmission")}
          </button>
          <button
            type="button"
            className="mt-3 w-full rounded-lg border border-[#E5E5E5] bg-white px-4 py-3 text-sm font-bold font-satoshi text-[#2F2F2F] transition-colors hover:bg-[#FAFAFA]"
          >
            {t("admin.verifications.viewHistory")}
          </button>
          <button
            type="button"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#135391] px-4 py-3 text-sm font-bold font-satoshi text-white transition-opacity hover:opacity-90"
          >
            <Bell className="h-4 w-4" strokeWidth={2} />
            {verification.audience === "vendor"
              ? t("admin.verifications.notifyVendor")
              : t("admin.verifications.notifyUser")}
          </button>
        </>
      ) : null}
    </section>
  );
}

function VerificationStatusBanner({
  verification,
}: {
  verification: AdminVerification;
}) {
  const t = useTranslation();

  if (verification.status === "pending") {
    return (
      <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-[#FFF3E0] bg-[#FFF9F0] px-4 py-3">
        <p className="text-sm font-semibold font-satoshi text-[#E65100]">
          {t("admin.verifications.pendingManualReview")}
        </p>
        {verification.pendingElapsed ? (
          <p className="shrink-0 text-sm font-medium font-satoshi text-[#E65100]">
            {t("admin.verifications.elapsed", {
              elapsed: verification.pendingElapsed,
            })}
          </p>
        ) : null}
      </div>
    );
  }

  if (verification.status === "approved") {
    return (
      <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-[#C8E6C9] bg-[#E8F5E9] px-4 py-3">
        <p className="flex items-center gap-2 text-sm font-semibold font-satoshi text-[#2E7D32]">
          <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} />
          {t("admin.verifications.verificationApproved")}
        </p>
        {verification.reviewedElapsed ? (
          <p className="shrink-0 text-sm font-medium font-satoshi text-[#2E7D32]">
            {t("admin.verifications.reviewedInElapsed", {
              elapsed: verification.reviewedElapsed,
            })}
          </p>
        ) : null}
      </div>
    );
  }

  if (verification.status === "denied") {
    return (
      <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-[#FFCDD2] bg-[#FDEBEB] px-4 py-3">
        <p className="flex items-center gap-2 text-sm font-semibold font-satoshi text-[#C0392B]">
          <X className="h-4 w-4 shrink-0" strokeWidth={2.5} />
          {t("admin.verifications.verificationDenied")}
        </p>
        {verification.reviewedElapsed ? (
          <p className="shrink-0 text-sm font-medium font-satoshi text-[#C0392B]">
            {t("admin.verifications.reviewedInElapsed", {
              elapsed: verification.reviewedElapsed,
            })}
          </p>
        ) : null}
      </div>
    );
  }

  return null;
}

function DocumentPreviewCard({
  labelKey,
}: {
  labelKey: AdminVerification["documentPreviews"][number]["labelKey"];
}) {
  const t = useTranslation();
  const isSelfie = labelKey === "admin.verifications.document.selfie";
  const Icon = isSelfie ? Smartphone : labelKey.includes("drivers") ? CreditCard : FileText;

  return (
    <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 rounded-lg border border-[#E8E8E8] bg-[#FAFAFA] px-4 text-center">
      <Icon className="h-8 w-8 text-[#BDBDBD]" strokeWidth={1.5} />
      <p className="text-sm font-medium font-satoshi text-[#676565]">
        {t(labelKey)}
      </p>
    </div>
  );
}
