"use client";

import { useMemo, useState } from "react";

import {
  ADMIN_PAYOUTS,
  type AdminPayout,
  type AdminPayoutStatus,
} from "@/features/admin/data/admin-payouts";
import { useFormatPrice } from "@/hooks/use-format-price";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

const STATUS_LABEL_KEYS: Record<AdminPayoutStatus, TranslationKey> = {
  pending: "admin.payouts.status.pending",
  completed: "admin.payouts.status.completed",
  failed: "admin.payouts.status.failed",
};

export function AdminPayoutsContent() {
  const t = useTranslation();
  const formatPrice = useFormatPrice();
  const [payouts, setPayouts] = useState(ADMIN_PAYOUTS);
  const [filter, setFilter] = useState<AdminPayoutStatus | "all">("all");

  const filtered = useMemo(
    () =>
      filter === "all" ? payouts : payouts.filter((p) => p.status === filter),
    [filter, payouts],
  );

  const markComplete = (id: string) => {
    setPayouts((current) =>
      current.map((p) =>
        p.id === id ? { ...p, status: "completed" as const } : p,
      ),
    );
  };

  const pendingCount = payouts.filter((p) => p.status === "pending").length;

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold font-satoshi text-[#2F2F2F]">
          {t("admin.payouts.title")}
        </h2>
        {pendingCount > 0 ? (
          <span className="rounded-full bg-[#FFF3E0] px-3 py-1 text-xs font-semibold font-satoshi text-[#E65100]">
            {t("admin.payouts.pendingCount", { count: pendingCount })}
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "pending", "completed", "failed"] as const).map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            className={`rounded-lg border px-3 py-2 text-xs font-semibold font-satoshi ${
              filter === status
                ? "border-[#135391] bg-[#F0F6FC] text-[#135391]"
                : "border-[#E5E5E5] bg-white text-[#676565]"
            }`}
          >
            {status === "all"
              ? t("admin.common.all")
              : t(STATUS_LABEL_KEYS[status])}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-[#EEEEEE] bg-white shadow-sm">
        <ul className="divide-y divide-[#F0F0F0]">
          {filtered.map((payout) => (
            <li
              key={payout.id}
              className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-bold font-satoshi text-[#2F2F2F]">
                  {payout.vendorName}
                </p>
                <p className="mt-0.5 text-sm font-medium font-satoshi text-[#676565]">
                  {formatPrice(payout.currency, payout.amount)} ·{" "}
                  {payout.bankName} {payout.accountNumber} ·{" "}
                  {payout.requestedAt}
                </p>
                <span
                  className={`mt-2 inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                    payout.status === "pending"
                      ? "bg-[#FFF3E0] text-[#E65100]"
                      : payout.status === "completed"
                        ? "bg-[#E8F5E9] text-[#2E7D32]"
                        : "bg-[#FDEBEB] text-[#C0392B]"
                  }`}
                >
                  {t(STATUS_LABEL_KEYS[payout.status])}
                </span>
              </div>
              {payout.status === "pending" ? (
                <button
                  type="button"
                  onClick={() => markComplete(payout.id)}
                  className="rounded-lg bg-[#2E7D32] px-4 py-2 text-sm font-bold font-satoshi text-white"
                >
                  {t("admin.payouts.markComplete")}
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
