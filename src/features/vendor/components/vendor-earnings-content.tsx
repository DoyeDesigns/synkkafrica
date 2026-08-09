"use client";

import Link from "next/link";
import { ChevronDown, Download } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  buildEarningsStatementCsv,
  computeCommissionSplitSummary,
  EARNINGS_DURATION_OPTIONS,
  filterTransactionsByDuration,
  VENDOR_COMMISSION_SPLIT,
  type EarningsDuration,
  type VendorTransaction,
} from "@/features/vendor/data/vendor-earnings";
import { VENDOR_PAYOUT_BANK_OPTIONS } from "@/features/vendor/data/vendor-business-profile";
import { useFormatPrice } from "@/hooks/use-format-price";
import { useClickOutside } from "@/hooks/use-click-outside";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";
import {
  getVendorEarnings,
  getVendorFullProfile,
  listVendorTransactions,
  requestVendorPayout,
  type VendorTransactionApi,
} from "@/lib/api/vendor";

const BANK_LABEL_BY_ID: Record<string, TranslationKey> = Object.fromEntries(
  VENDOR_PAYOUT_BANK_OPTIONS.map((b) => [b.id, b.labelKey]),
);

function toFeTxn(t: VendorTransactionApi): VendorTransaction {
  return {
    id: t.id,
    title: t.title,
    descriptionKey: t.description as VendorTransaction["descriptionKey"],
    date: t.date,
    amount: t.amount,
    currency: t.currency,
    type: t.type,
    status: t.status,
  };
}

const STATUS_LABEL_KEYS: Record<
  VendorTransaction["status"],
  TranslationKey
> = {
  completed: "vendor.earnings.status.completed",
  pending: "vendor.earnings.status.pending",
  failed: "vendor.earnings.status.failed",
};

const DURATION_LABEL_KEYS: Record<EarningsDuration, TranslationKey> = {
  daily: "vendor.earnings.duration.daily",
  weekly: "vendor.earnings.duration.weekly",
  monthly: "vendor.earnings.duration.monthly",
  all: "vendor.earnings.duration.all",
};

function formatTransactionDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

type VendorEarningsContentProps = {
  vendorName?: string | null;
};

export function VendorEarningsContent({
  vendorName,
}: VendorEarningsContentProps) {
  const t = useTranslation();
  const formatPrice = useFormatPrice();
  const { data: session } = useSession();
  const token = session?.accessToken;
  const queryClient = useQueryClient();
  const displayName = vendorName?.trim() || "your business";
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [duration, setDuration] = useState<EarningsDuration>("all");
  const [durationOpen, setDurationOpen] = useState(false);
  const [payoutError, setPayoutError] = useState<string | null>(null);
  const [payoutDone, setPayoutDone] = useState(false);
  const durationDropdownRef = useRef<HTMLDivElement>(null);

  const { data: earnings } = useQuery({
    queryKey: ["vendor-earnings"],
    queryFn: () => getVendorEarnings(token as string),
    enabled: Boolean(token),
    refetchOnWindowFocus: false,
  });
  const { data: rawTransactions } = useQuery({
    queryKey: ["vendor-transactions"],
    queryFn: () => listVendorTransactions(token as string),
    enabled: Boolean(token),
    refetchOnWindowFocus: false,
  });
  const { data: profile } = useQuery({
    queryKey: ["vendor-full-profile"],
    queryFn: () => getVendorFullProfile(token as string),
    enabled: Boolean(token),
    refetchOnWindowFocus: false,
  });

  // The vendor's real payout account, from their business profile. One account
  // per vendor (no dummy multi-account dropdown).
  const payoutAccount = useMemo(() => {
    const number = profile?.payoutAccountNumber?.trim();
    if (!number) return null;
    const bankLabelKey = profile?.payoutBankId
      ? BANK_LABEL_BY_ID[profile.payoutBankId]
      : undefined;
    const bankLabel = bankLabelKey ? t(bankLabelKey) : (profile?.payoutBankId ?? "");
    const masked = `••••${number.slice(-4)}`;
    return {
      bankLabel,
      masked,
      accountName: profile?.payoutAccountName?.trim() ?? "",
      // Human-readable identifier used as the withdrawal transaction title.
      title: [bankLabel, masked].filter(Boolean).join(" "),
    };
  }, [profile, t]);

  const currency = earnings?.currency ?? "NGN";
  const availableBalance = earnings?.availableBalance ?? 0;
  const transactions = useMemo(
    () => (rawTransactions ?? []).map(toFeTxn),
    [rawTransactions],
  );

  const payoutMutation = useMutation({
    mutationFn: (amount: number) =>
      requestVendorPayout(token as string, amount, payoutAccount?.title),
    onSuccess: () => {
      setWithdrawAmount("");
      setPayoutError(null);
      setPayoutDone(true);
      window.setTimeout(() => setPayoutDone(false), 2500);
      void queryClient.invalidateQueries({ queryKey: ["vendor-earnings"] });
      void queryClient.invalidateQueries({ queryKey: ["vendor-transactions"] });
    },
    onError: () => setPayoutError("Couldn't process that withdrawal."),
  });

  const handleWithdraw = () => {
    const amount = Number(withdrawAmount);
    setPayoutError(null);
    if (!payoutAccount) {
      setPayoutError(t("vendor.earnings.noBankAccount"));
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setPayoutError("Enter a valid amount.");
      return;
    }
    if (amount > availableBalance) {
      setPayoutError("Amount exceeds your available balance.");
      return;
    }
    payoutMutation.mutate(amount);
  };

  useClickOutside(durationDropdownRef, () => setDurationOpen(false), durationOpen);

  const filteredTransactions = useMemo(
    () => filterTransactionsByDuration(transactions, duration),
    [transactions, duration],
  );

  const commissionSummary = useMemo(
    () => computeCommissionSplitSummary(filteredTransactions),
    [filteredTransactions],
  );

  const handleDownloadStatement = () => {
    const csv = buildEarningsStatementCsv(filteredTransactions, {
      date: t("vendor.earnings.statement.date"),
      title: t("vendor.earnings.statement.title"),
      description: t("vendor.earnings.statement.description"),
      type: t("vendor.earnings.statement.type"),
      amount: t("vendor.earnings.statement.amount"),
      status: t("vendor.earnings.statement.status"),
      completed: t("vendor.earnings.status.completed"),
      pending: t("vendor.earnings.status.pending"),
      failed: t("vendor.earnings.status.failed"),
      "vendor.earnings.transaction.bookingPayment": t(
        "vendor.earnings.transaction.bookingPayment",
      ),
      "vendor.earnings.transaction.withdrawal": t(
        "vendor.earnings.transaction.withdrawal",
      ),
      "vendor.earnings.transaction.platformFee": t(
        "vendor.earnings.transaction.platformFee",
      ),
      "vendor.earnings.transaction.refund": t(
        "vendor.earnings.transaction.refund",
      ),
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `synkafrica-earnings-${duration}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <h2 className="text-xl font-medium font-satoshi text-[#2F2F2F]">
        {t("vendor.dashboard.welcomeBack")}{" "}
        <span className="font-bold text-[#D85A30]">{displayName}</span>
      </h2>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm">
              <p className="text-sm font-bold font-satoshi text-[#3C3C3C]">
                {t("vendor.earnings.availableBalance")}
              </p>
              <p className="mt-2 text-3xl font-bold font-inter text-[#D85A30]">
                {formatPrice(currency, availableBalance)}
              </p>
            </div>

            <div className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-bold font-satoshi text-[#3C3C3C]">
                  {t("vendor.earnings.lifetimeEarnings")}
                </p>

                <div ref={durationDropdownRef} className="relative shrink-0">
                  <button
                    type="button"
                    aria-label={t("vendor.earnings.duration.label")}
                    aria-expanded={durationOpen}
                    aria-haspopup="listbox"
                    onClick={() => setDurationOpen((open) => !open)}
                    className="flex h-9 min-w-28 items-center justify-between gap-2 rounded-full border border-[#E5E5E5] bg-white px-3 text-xs font-semibold font-satoshi text-[#2F2F2F] outline-none transition-colors hover:border-[#D85A30] focus:border-[#D85A30]"
                  >
                    <span>{t(DURATION_LABEL_KEYS[duration])}</span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 shrink-0 text-[#676565] transition-transform ${durationOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {durationOpen ? (
                    <ul
                      role="listbox"
                      aria-label={t("vendor.earnings.duration.label")}
                      className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-full overflow-hidden rounded-xl border border-[#E5E5E5] bg-white py-1 shadow-lg"
                    >
                      {EARNINGS_DURATION_OPTIONS.map((option) => {
                        const isSelected = option === duration;

                        return (
                          <li key={option} role="presentation" className="w-full">
                            <button
                              type="button"
                              role="option"
                              aria-selected={isSelected}
                              onClick={() => {
                                setDuration(option);
                                setDurationOpen(false);
                              }}
                              className={`block w-full px-3 py-2 text-left text-xs font-semibold font-satoshi transition-colors ${
                                isSelected
                                  ? "bg-[#FFF1EB] text-[#D85A30]"
                                  : "text-[#2F2F2F] hover:bg-[#FAFAFA]"
                              }`}
                            >
                              {t(DURATION_LABEL_KEYS[option])}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </div>
              </div>

              <p className="mt-2 text-3xl font-bold font-inter text-[#D85A30]">
                {formatPrice(
                  commissionSummary.currency,
                  commissionSummary.vendorShare,
                )}
              </p>

              <p className="mt-2 text-xs font-medium font-satoshi text-[#676565]">
                {t("vendor.earnings.commissionSplitHint", {
                  vendor: VENDOR_COMMISSION_SPLIT.vendorSharePercent,
                  platform: VENDOR_COMMISSION_SPLIT.platformSharePercent,
                })}
              </p>
            </div>
          </div>

          <section>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-base font-bold font-satoshi text-[#2F2F2F]">
                {t("vendor.earnings.transactionHistory")}
              </h3>

              <button
                type="button"
                onClick={handleDownloadStatement}
                disabled={filteredTransactions.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#D85A30] bg-white px-4 py-2.5 text-sm font-bold font-satoshi text-[#D85A30] transition-colors hover:bg-[#FFF1EB] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download className="h-4 w-4" strokeWidth={2} />
                {t("vendor.earnings.downloadStatements")}
              </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-[#EEEEEE] bg-white shadow-sm">
              {filteredTransactions.length > 0 ? (
                <ul className="divide-y divide-[#F0F0F0]">
                  {filteredTransactions.map((transaction) => (
                    <li
                      key={transaction.id}
                      className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold font-satoshi text-[#2F2F2F]">
                          {transaction.title}
                        </p>
                        <p className="mt-0.5 text-xs font-medium font-satoshi text-[#676565]">
                          {t(transaction.descriptionKey)} ·{" "}
                          {formatTransactionDate(transaction.date)}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end lg:flex-row lg:items-center">
                        <p
                          className={`text-sm font-bold font-satoshi ${
                            transaction.type === "credit"
                              ? "text-[#2E7D32]"
                              : "text-[#2F2F2F]"
                          }`}
                        >
                          {transaction.type === "credit" ? "+" : "-"}
                          {formatPrice(transaction.currency, transaction.amount)}
                        </p>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold font-satoshi ${
                            transaction.status === "completed"
                              ? "bg-[#E8F5E9] text-[#2E7D32]"
                              : transaction.status === "pending"
                                ? "bg-[#FFF3E0] text-[#E65100]"
                                : "bg-[#FDEBEB] text-[#C0392B]"
                          }`}
                        >
                          {t(STATUS_LABEL_KEYS[transaction.status])}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-5 py-10 text-center">
                  <p className="text-sm font-medium font-satoshi text-[#676565]">
                    {t("vendor.earnings.emptyTransactions")}
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-0 xl:self-start">
          <h3 className="mb-4 text-base font-bold font-satoshi text-[#2F2F2F]">
            {t("vendor.earnings.withdrawFunds")}
          </h3>

          <div className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm">
            <div className="space-y-4">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
                  {t("vendor.earnings.amountToWithdraw")}
                </span>
                <div className="flex overflow-hidden rounded-lg border border-[#E5E5E5] bg-white">
                  <span className="flex items-center border-r border-[#E5E5E5] bg-[#F8F8F8] px-3 text-sm font-medium font-satoshi text-[#676565]">
                    {currency}
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={withdrawAmount}
                    onChange={(event) => setWithdrawAmount(event.target.value)}
                    placeholder="0.00"
                    className="min-w-0 flex-1 px-3 py-2.5 text-sm font-medium font-satoshi text-foreground outline-none placeholder:text-[#BDBCBC]"
                  />
                </div>
                <span className="text-xs font-medium font-satoshi text-[#676565]">
                  {t("vendor.earnings.availableHint")}{" "}
                  {formatPrice(currency, availableBalance)}
                </span>
              </label>

              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
                  {t("vendor.earnings.payoutAccount")}
                </span>
                {payoutAccount ? (
                  <div className="rounded-lg border border-[#E5E5E5] bg-white px-3 py-2.5">
                    <p className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
                      {payoutAccount.bankLabel} {payoutAccount.masked}
                    </p>
                    {payoutAccount.accountName ? (
                      <p className="mt-0.5 text-xs font-medium font-satoshi text-[#676565]">
                        {payoutAccount.accountName}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <div className="rounded-lg border border-[#F1C7B8] bg-[#FDF3EF] px-3 py-2.5">
                    <p className="text-xs font-medium font-satoshi text-[#C0392B]">
                      {t("vendor.earnings.noBankAccount")}
                    </p>
                    <Link
                      href="/vendor/business-profile"
                      className="mt-1 inline-block text-xs font-bold font-satoshi text-[#135391] hover:underline"
                    >
                      {t("vendor.earnings.addBankAccount")}
                    </Link>
                  </div>
                )}
              </div>

              <div className="rounded-lg bg-[#F8F8F8] px-3 py-2.5">
                <p className="text-xs font-medium font-satoshi text-[#676565]">
                  {t("vendor.earnings.processingNote")}
                </p>
              </div>
            </div>
          </div>

          {payoutError ? (
            <p className="mb-2 text-xs font-medium font-satoshi text-[#C0392B]">
              {payoutError}
            </p>
          ) : payoutDone ? (
            <p className="mb-2 text-xs font-semibold font-satoshi text-[#2E7D32]">
              {t("vendor.earnings.withdrawFunds")} ✓
            </p>
          ) : null}

          <button
            type="button"
            onClick={handleWithdraw}
            disabled={
              payoutMutation.isPending ||
              availableBalance <= 0 ||
              !payoutAccount
            }
            className="w-full rounded-lg bg-[#4B4A4A] px-5 py-3 text-sm font-bold font-montserrat text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {payoutMutation.isPending
              ? t("common.loading")
              : t("vendor.earnings.withdrawFunds")}
          </button>
        </aside>
      </div>
    </>
  );
}
