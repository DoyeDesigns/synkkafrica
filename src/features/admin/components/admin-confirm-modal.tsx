"use client";

import { useEffect, useRef } from "react";

type AdminConfirmModalProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function AdminConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive = false,
  onConfirm,
  onClose,
}: AdminConfirmModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-message"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="space-y-2">
          <h3
            id="confirm-modal-title"
            className="text-xl font-bold font-satoshi text-[#2F2F2F]"
          >
            {title}
          </h3>
          <p
            id="confirm-modal-message"
            className="text-sm font-medium font-satoshi leading-relaxed text-[#676565]"
          >
            {message}
          </p>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-[#E5E5E5] px-5 text-sm font-bold font-satoshi text-[#2F2F2F] transition-colors hover:bg-[#FAFAFA]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`inline-flex h-11 items-center justify-center rounded-lg px-5 text-sm font-bold font-satoshi text-white transition-opacity hover:opacity-90 ${
              destructive ? "bg-[#DD2222]" : "bg-[#135391]"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
