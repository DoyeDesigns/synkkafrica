"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

import {
  VENDOR_BANK_ACCOUNTS,
  VENDOR_EARNINGS_SUMMARY,
  VENDOR_TRANSACTIONS,
  type VendorTransaction,
} from "@/features/vendor/data/vendor-earnings";
import { useFormatPrice } from "@/hooks/use-format-price";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

const STATUS_LABEL_KEYS: Record<
  VendorTransaction["status"],
  TranslationKey
> = {
  completed: "vendor.earnings.status.completed",
  pending: "vendor.earnings.status.pending",
  failed: "vendor.earnings.status.failed",
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
  vendorName = "Alex Autos",
}: VendorEarningsContentProps) {
  const t = useTranslation();
  const formatPrice = useFormatPrice();
  const displayName = vendorName?.trim() || "Alex Autos";
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedBankId, setSelectedBankId] = useState(VENDOR_BANK_ACCOUNTS[0]?.id ?? "");

  const { currency, availableBalance, lifetimeEarnings } = VENDOR_EARNINGS_SUMMARY;

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
              <p className="text-sm font-bold font-satoshi text-[#3C3C3C]">
                {t("vendor.earnings.lifetimeEarnings")}
              </p>
              <p className="mt-2 text-3xl font-bold font-inter text-[#D85A30]">
                {formatPrice(currency, lifetimeEarnings)}
              </p>
            </div>
          </div>

          <section>
            <h3 className="mb-4 text font-bold font-satoshi text-[#2F2F2F]">
              {t("vendor.earnings.transactionHistory")}
            </h3>

            <div className="overflow-hidden rounded-xl border border-[#EEEEEE] bg-white shadow-sm">
              <ul className="divide-y divide-[#F0F0F0]">
                {VENDOR_TRANSACTIONS.map((transaction) => (
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
            </div>
          </section>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-0 xl:self-start">
          <h3 className="mb-4 text font-bold font-satoshi text-[#2F2F2F]">
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

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
                  {t("vendor.earnings.selectBankAccount")}
                </span>
                <div className="relative">
                  <select
                    value={selectedBankId}
                    onChange={(event) => setSelectedBankId(event.target.value)}
                    className="h-11 w-full appearance-none rounded-lg border border-[#E5E5E5] bg-white px-3 pr-10 text-sm font-medium font-satoshi text-foreground outline-none focus:border-[#004785]"
                  >
                    {VENDOR_BANK_ACCOUNTS.map((account) => (
                      <option key={account.id} value={account.id}>
                        {t(account.labelKey)} {account.accountNumber}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]"
                    strokeWidth={1.75}
                  />
                </div>
              </label>

              <div className="rounded-lg bg-[#F8F8F8] px-3 py-2.5">
                <p className="text-xs font-medium font-satoshi text-[#676565]">
                  {t("vendor.earnings.processingNote")}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="w-full rounded-lg bg-[#4B4A4A] px-5 py-3 text-sm font-bold font-montserrat text-white transition-opacity hover:opacity-90"
          >
            {t("vendor.earnings.withdrawFunds")}
          </button>
        </aside>
      </div>
    </>
  );
}
