"use client";

import { useEffect } from "react";

import { useTranslation } from "@/hooks/use-translation";

type VendorDeleteListingModalProps = {
  listingTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function VendorDeleteListingModal({
  listingTitle,
  isOpen,
  onClose,
  onConfirm,
}: VendorDeleteListingModalProps) {
  const t = useTranslation();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-listing-title"
        aria-describedby="delete-listing-message"
        className="w-full max-w-md rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-xl sm:p-6"
      >
        <h2
          id="delete-listing-title"
          className="text-lg font-bold font-satoshi text-[#2F2F2F]"
        >
          {t("vendor.dashboard.deleteListingModal.title")}
        </h2>
        <p
          id="delete-listing-message"
          className="mt-2 text-sm font-medium font-satoshi leading-relaxed text-[#676565]"
        >
          {t("vendor.dashboard.deleteListingModal.message", { title: listingTitle })}
        </p>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#E5E5E5] bg-white px-4 py-2.5 text-sm font-bold font-satoshi text-[#2F2F2F] transition-colors hover:bg-[#FAFAFA]"
          >
            {t("vendor.dashboard.deleteListingModal.cancel")}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="rounded-lg bg-[#C0392B] px-4 py-2.5 text-sm font-bold font-satoshi text-white transition-opacity hover:opacity-90"
          >
            {t("vendor.dashboard.deleteListingModal.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
