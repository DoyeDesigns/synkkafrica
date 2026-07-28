"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

import { useTranslation } from "@/hooks/use-translation";

type VendorDeclineBookingModalProps = {
  bookingReference: string;
  guestName: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
};

export function VendorDeclineBookingModal({
  bookingReference,
  guestName,
  isOpen,
  onClose,
  onSubmit,
}: VendorDeclineBookingModalProps) {
  const t = useTranslation();
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setReason("");
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = () => {
    if (!reason.trim()) {
      return;
    }

    onSubmit(reason.trim());
    setReason("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="decline-booking-title"
        className="w-full max-w-md rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id="decline-booking-title"
              className="text-lg font-bold font-satoshi text-[#2F2F2F]"
            >
              {t("vendor.bookings.declineModal.title")}
            </h2>
            <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
              {t("vendor.bookings.declineModal.subtitle", {
                reference: bookingReference,
                guest: guestName,
              })}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[#676565] transition-colors hover:bg-[#F5F5F5]"
            aria-label={t("vendor.bookings.declineModal.cancel")}
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        <label className="mt-5 flex flex-col gap-2">
          <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
            {t("vendor.bookings.declineModal.reasonLabel")}
          </span>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder={t("vendor.bookings.declineModal.reasonPlaceholder")}
            className="min-h-[120px] w-full resize-y rounded-lg border border-[#E5E5E5] bg-white px-3 py-2.5 text-sm font-medium font-satoshi text-foreground outline-none focus:border-[#004785]"
          />
        </label>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#E5E5E5] bg-white px-4 py-2.5 text-sm font-bold font-satoshi text-[#2F2F2F] transition-colors hover:bg-[#FAFAFA]"
          >
            {t("vendor.bookings.declineModal.cancel")}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!reason.trim()}
            className="rounded-lg bg-[#C0392B] px-4 py-2.5 text-sm font-bold font-satoshi text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("vendor.bookings.declineModal.submit")}
          </button>
        </div>
      </div>
    </div>
  );
}
