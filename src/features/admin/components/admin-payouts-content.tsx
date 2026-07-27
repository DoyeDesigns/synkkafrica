"use client";

import {
  Banknote,
  Check,
  ChevronDown,
  Hourglass,
  Search,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import {
  ADMIN_PAYOUTS,
  filterAdminPayouts,
  formatAdminPayoutDate,
  formatAdminPayoutPeriod,
  getAdminPayoutStats,
  type AdminPayout,
  type AdminPayoutStatus,
} from "@/features/admin/data/admin-payouts";
import { useFormatPrice } from "@/hooks/use-format-price";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

const STATUS_LABEL_KEYS: Record<AdminPayoutStatus, TranslationKey> = {
  pending: "admin.payouts.status.pending",
  completed: "admin.payouts.status.completed",
  declined: "admin.payouts.status.declined",
  failed: "admin.payouts.status.failedTransfer",
};

const STATUS_BADGE_STYLES: Record<AdminPayoutStatus, string> = {
  pending: "bg-[#FFF3E0] text-[#E65100]",
  completed: "bg-[#E8F5E9] text-[#2E7D32]",
  declined: "bg-[#FDEBEB] text-[#C0392B]",
  failed: "bg-[#E8EAF6] text-[#3949AB]",
};

const FILTER_OPTIONS: Array<AdminPayoutStatus | "all"> = [
  "all",
  "pending",
  "completed",
  "declined",
  "failed",
];

export function AdminPayoutsContent() {
  const t = useTranslation();
  const formatPrice = useFormatPrice();
  const [payouts, setPayouts] = useState(ADMIN_PAYOUTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<AdminPayoutStatus | "all">("all");
  const [selectedId, setSelectedId] = useState(ADMIN_PAYOUTS[0]?.id ?? "");
  const [period, setPeriod] = useState("2026-07");

  const stats = useMemo(() => getAdminPayoutStats(payouts), [payouts]);

  const filteredPayouts = useMemo(
    () => filterAdminPayouts(payouts, searchQuery, filter),
    [filter, payouts, searchQuery],
  );

  const selectedPayout = useMemo(
    () => payouts.find((payout) => payout.id === selectedId) ?? filteredPayouts[0],
    [filteredPayouts, payouts, selectedId],
  );

  const counts = useMemo(
    () => ({
      all: payouts.length,
      pending: payouts.filter((p) => p.status === "pending").length,
      completed: payouts.filter((p) => p.status === "completed").length,
      declined: payouts.filter((p) => p.status === "declined").length,
      failed: payouts.filter((p) => p.status === "failed").length,
    }),
    [payouts],
  );

  const updateStatus = (id: string, status: AdminPayoutStatus) => {
    setPayouts((current) =>
      current.map((payout) => (payout.id === id ? { ...payout, status } : payout)),
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-bold font-satoshi text-[#2F2F2F]">
            {t("admin.payouts.title")}
          </h2>
          <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
            {t("admin.payouts.subtitle")}
          </p>
        </div>

        <div className="relative w-full sm:w-56">
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            className="h-11 w-full appearance-none rounded-lg border border-[#E5E5E5] bg-white pl-4 pr-10 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none focus:border-[#135391]"
          >
            <option value="2026-07">{t("admin.payouts.period.thisMonth")}</option>
            <option value="2026-06">{t("admin.payouts.period.lastMonth")}</option>
            <option value="2026-q2">{t("admin.payouts.period.quarter")}</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryStatCard
          label={t("admin.payouts.stats.totalPeriod")}
          value={formatPrice(stats.currency, stats.total)}
          subtitle={t("admin.payouts.stats.totalVendors", { count: stats.vendorCount })}
          valueClassName="text-[#135391]"
          icon={Banknote}
        />
        <SummaryStatCard
          label={t("admin.payouts.stats.pending")}
          value={formatPrice(stats.currency, stats.pending)}
          subtitle={t("admin.payouts.stats.pendingSubtitle", { count: stats.pendingCount })}
          valueClassName="text-[#D85A30]"
          icon={Hourglass}
        />
        <SummaryStatCard
          label={t("admin.payouts.stats.completed")}
          value={formatPrice(stats.currency, stats.completed)}
          subtitle={t("admin.payouts.stats.completedSubtitle", { count: stats.completedCount })}
          valueClassName="text-[#2E7D32]"
          icon={Check}
        />
        <SummaryStatCard
          label={t("admin.payouts.stats.declinedFailed")}
          value={formatPrice(stats.currency, stats.declined + stats.failed)}
          subtitle={t("admin.payouts.stats.declinedFailedSubtitle", {
            declined: stats.declinedCount,
            failed: stats.failedCount,
          })}
          valueClassName="text-[#DD2222]"
          icon={X}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section className="rounded-xl border border-[#EEEEEE] bg-white shadow-sm">
          <div className="space-y-4 border-b border-[#F0F0F0] p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={t("admin.payouts.searchPlaceholder")}
                className="h-11 w-full rounded-full border border-[#E5E5E5] bg-white pl-11 pr-4 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none focus:border-[#135391]"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {FILTER_OPTIONS.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFilter(status)}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold font-satoshi transition-colors ${
                    filter === status
                      ? "bg-[#135391] text-white"
                      : "border border-[#E5E5E5] bg-white text-[#676565] hover:bg-[#FAFAFA]"
                  }`}
                >
                  {status === "all"
                    ? t("admin.payouts.filter.all", { count: counts.all })
                    : t(`admin.payouts.filter.${status}` as TranslationKey, {
                        count: counts[status],
                      })}
                </button>
              ))}
            </div>
          </div>

          <ul className="max-h-[640px] divide-y divide-[#F0F0F0] overflow-y-auto">
            {filteredPayouts.length > 0 ? (
              filteredPayouts.map((payout) => (
                <PayoutListItem
                  key={payout.id}
                  payout={payout}
                  isSelected={selectedPayout?.id === payout.id}
                  formatPrice={formatPrice}
                  onSelect={() => setSelectedId(payout.id)}
                />
              ))
            ) : (
              <li className="px-5 py-10 text-center text-sm font-medium text-[#676565]">
                {t("admin.payouts.empty")}
              </li>
            )}
          </ul>
        </section>

        {selectedPayout ? (
          <PayoutDetailPanel
            payout={selectedPayout}
            formatPrice={formatPrice}
            onMarkComplete={() => updateStatus(selectedPayout.id, "completed")}
            onDecline={() => updateStatus(selectedPayout.id, "declined")}
          />
        ) : null}
      </div>
    </div>
  );
}

function SummaryStatCard({
  label,
  value,
  subtitle,
  valueClassName,
  icon: Icon,
}: {
  label: string;
  value: string;
  subtitle: string;
  valueClassName: string;
  icon: typeof Banknote;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[#EEEEEE] bg-white px-5 py-4 shadow-sm">
      <Icon className="absolute right-4 top-4 h-8 w-8 text-[#ECEFF1]" strokeWidth={1.5} />
      <p className={`text-xl font-bold font-inter ${valueClassName}`}>{value}</p>
      <p className="mt-1 text-xs font-semibold font-satoshi text-[#676565]">{label}</p>
      <p className="mt-0.5 text-xs font-medium font-satoshi text-[#9E9E9E]">{subtitle}</p>
    </div>
  );
}

function PayoutListItem({
  payout,
  isSelected,
  formatPrice,
  onSelect,
}: {
  payout: AdminPayout;
  isSelected: boolean;
  formatPrice: (currency: string, amount: number) => string;
  onSelect: () => void;
}) {
  const t = useTranslation();

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={`flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-[#FAFAFA] ${
          isSelected ? "border-l-4 border-[#135391] bg-[#F0F6FC]" : "border-l-4 border-transparent"
        }`}
      >
        <div className="min-w-0">
          <p className="font-bold font-satoshi text-[#2F2F2F]">{payout.vendorName}</p>
          <p className="mt-1 text-xs font-medium font-satoshi text-[#676565]">
            {payout.category} &bull; {payout.referenceId} &bull;{" "}
            {t("admin.payouts.requested", {
              date: formatAdminPayoutDate(payout.requestedAt),
            })}
          </p>
          <p className="mt-0.5 text-xs font-medium font-satoshi text-[#9E9E9E]">
            {t("admin.payouts.listBookingsBank", {
              count: payout.bookingsCount,
              bank: payout.bankName,
              account: payout.accountNumber,
            })}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="font-bold font-satoshi text-[#2F2F2F]">
            {formatPrice(payout.currency, payout.netPayout)}
          </p>
          <span
            className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${STATUS_BADGE_STYLES[payout.status]}`}
          >
            {t(STATUS_LABEL_KEYS[payout.status])}
          </span>
        </div>
      </button>
    </li>
  );
}

function PayoutDetailPanel({
  payout,
  formatPrice,
  onMarkComplete,
  onDecline,
}: {
  payout: AdminPayout;
  formatPrice: (currency: string, amount: number) => string;
  onMarkComplete: () => void;
  onDecline: () => void;
}) {
  const t = useTranslation();

  return (
    <section className="rounded-xl border border-[#EEEEEE] bg-white shadow-sm">
      <div className="border-b border-[#F0F0F0] p-5">
        <h3 className="text-base font-bold font-satoshi text-[#2F2F2F]">
          {payout.vendorName} &mdash; {payout.referenceId}
        </h3>
        <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
          {payout.category} &bull;{" "}
          {t("admin.payouts.requested", {
            date: formatAdminPayoutDate(payout.requestedAt),
          })}{" "}
          &bull;{" "}
          {t("admin.payouts.periodLabel", {
            period: formatAdminPayoutPeriod(payout.periodStart, payout.periodEnd),
          })}
        </p>
      </div>

      <div className="space-y-6 p-5">
        <div className="rounded-lg bg-[#FAFAFA] px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#676565]">
            {t("admin.payouts.netPayoutToVendor")}
          </p>
          <p className="mt-2 text-2xl font-bold font-inter text-[#2F2F2F]">
            {formatPrice(payout.currency, payout.netPayout)}
          </p>
          <dl className="mt-4 space-y-2 text-sm font-satoshi">
            <div className="flex justify-between gap-4">
              <dt className="text-[#676565]">{t("admin.payouts.grossEarnings")}</dt>
              <dd className="font-semibold text-[#2F2F2F]">
                {formatPrice(payout.currency, payout.grossEarnings)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[#676565]">
                {t("admin.payouts.platformCommission", { rate: payout.commissionRate })}
              </dt>
              <dd className="font-semibold text-[#DD2222]">
                - {formatPrice(payout.currency, payout.commissionAmount)}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-dotted border-[#E0E0E0] pt-2">
              <dt className="font-semibold text-[#2F2F2F]">{t("admin.payouts.netPayout")}</dt>
              <dd className="font-bold text-[#2F2F2F]">
                {formatPrice(payout.currency, payout.netPayout)}
              </dd>
            </div>
          </dl>
        </div>

        <DetailSection title={t("admin.payouts.paymentDestination")}>
          <DetailRow label={t("admin.payouts.bank")} value={payout.bankName} />
          <DetailRow label={t("admin.payouts.accountNumber")} value={payout.accountNumber} />
          <DetailRow label={t("admin.payouts.accountName")} value={payout.accountName} />
          <DetailRow label={t("admin.payouts.payoutMethod")} value={payout.payoutMethod} />
        </DetailSection>

        <DetailSection
          title={t("admin.payouts.associatedBookings", { count: payout.bookingsCount })}
        >
          {payout.associatedBookings.map((booking) => (
            <DetailRow
              key={booking.id}
              label={booking.id}
              value={formatPrice(payout.currency, booking.amount)}
            />
          ))}
        </DetailSection>

        {payout.internalNote ? (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9E9E9E]">
              {t("admin.payouts.internalNote")}
            </p>
            <div className="mt-3 rounded-lg bg-[#F0F6FC] px-4 py-4">
              <p className="text-sm leading-relaxed text-[#2F2F2F]">
                {payout.internalNote.text}
              </p>
              <p className="mt-3 text-xs font-medium text-[#676565]">
                {t("admin.payouts.noteAttribution", {
                  author: payout.internalNote.author,
                  date: payout.internalNote.date,
                })}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex justify-center flex-wrap gap-3 border-t border-[#F0F0F0] p-5">
        {payout.status === "pending" ? (
          <button
            type="button"
            onClick={onMarkComplete}
            className="rounded-lg bg-[#2E7D32] px-4 py-2.5 text-sm font-bold font-satoshi text-white transition-opacity hover:opacity-90"
          >
            {t("admin.payouts.markComplete")}
          </button>
        ) : null}
        <button
          type="button"
          className="rounded-lg border border-[#E5E5E5] bg-white px-4 py-2.5 text-sm font-bold font-satoshi text-[#2F2F2F] transition-colors hover:bg-[#FAFAFA]"
        >
          {t("admin.payouts.contactVendor")}
        </button>
        {payout.status === "pending" ? (
          <button
            type="button"
            onClick={onDecline}
            className="rounded-lg border border-[#DD2222] bg-white px-4 py-2.5 text-sm font-bold font-satoshi text-[#DD2222] transition-colors hover:bg-[#FFF5F5]"
          >
            {t("admin.payouts.decline")}
          </button>
        ) : null}
      </div>
    </section>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9E9E9E]">
        {title}
      </p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-dotted border-[#E0E0E0] py-2.5 last:border-b-0">
      <span className="text-sm font-medium font-satoshi text-[#676565]">{label}</span>
      <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">{value}</span>
    </div>
  );
}
