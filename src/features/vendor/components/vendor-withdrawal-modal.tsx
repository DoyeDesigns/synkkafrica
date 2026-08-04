"use client";

import { useState } from "react";

import { useTranslation } from "@/hooks/use-translation";

const WITHDRAWAL_AUTH_THRESHOLD_NGN = 200_000;

type VendorWithdrawalModalProps = {
  amount: number;
  currency: string;
  onClose: () => void;
  onConfirm: (payload: { pin: string; otp: string }) => void;
};

export function VendorWithdrawalModal({
  amount,
  currency,
  onClose,
  onConfirm,
}: VendorWithdrawalModalProps) {
  const t = useTranslation();
  const [pin, setPin] = useState("");
  const [otp, setOtp] = useState("");
  const requiresApproval = amount > WITHDRAWAL_AUTH_THRESHOLD_NGN;
  const requiresStrongAuth = amount >= WITHDRAWAL_AUTH_THRESHOLD_NGN;

  const formattedAmount = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="withdrawal-modal-title"
        className="w-full max-w-md rounded-xl border border-[#EEEEEE] bg-white p-6 shadow-xl"
      >
        <h2
          id="withdrawal-modal-title"
          className="text-lg font-bold font-satoshi text-[#2F2F2F]"
        >
          {t("vendor.earnings.withdrawalModal.title")}
        </h2>
        <p className="mt-2 text-sm font-medium font-satoshi text-[#676565]">
          {formattedAmount}
        </p>

        {requiresApproval ? (
          <p className="mt-3 rounded-lg bg-[#FFF3E0] px-3 py-2.5 text-xs font-medium font-satoshi text-[#E65100]">
            {t("vendor.earnings.withdrawalModal.pendingApproval")}
          </p>
        ) : null}

        {requiresStrongAuth ? (
          <div className="mt-4 space-y-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
                {t("vendor.earnings.withdrawalModal.pin")}
              </span>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(event) => setPin(event.target.value)}
                className="h-11 rounded-lg border border-[#E5E5E5] px-3 text-sm font-medium font-satoshi outline-none focus:border-[#135391]"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
                {t("vendor.earnings.withdrawalModal.otp")}
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                  className="h-11 min-w-0 flex-1 rounded-lg border border-[#E5E5E5] px-3 text-sm font-medium font-satoshi outline-none focus:border-[#135391]"
                />
                <button
                  type="button"
                  className="shrink-0 rounded-lg border border-[#135391] px-3 text-xs font-bold font-satoshi text-[#135391] hover:bg-[#F0F6FC]"
                >
                  {t("vendor.earnings.withdrawalModal.sendOtp")}
                </button>
              </div>
            </label>
          </div>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-[#E5E5E5] px-5 text-sm font-bold font-satoshi text-[#2F2F2F] hover:bg-[#FAFAFA]"
          >
            {t("vendor.earnings.withdrawalModal.cancel")}
          </button>
          <button
            type="button"
            disabled={requiresStrongAuth && (!pin.trim() || !otp.trim())}
            onClick={() => onConfirm({ pin, otp })}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-[#D85A30] px-5 text-sm font-bold font-satoshi text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("vendor.earnings.withdrawalModal.submit")}
          </button>
        </div>
      </div>
    </div>
  );
}

export { WITHDRAWAL_AUTH_THRESHOLD_NGN };
