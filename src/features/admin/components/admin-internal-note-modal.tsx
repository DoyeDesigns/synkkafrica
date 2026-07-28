"use client";

import { useEffect, useRef, useState } from "react";

type AdminInternalNoteModalProps = {
  open: boolean;
  title: string;
  subtitle: string;
  label: string;
  placeholder: string;
  submitLabel: string;
  cancelLabel: string;
  initialValue?: string;
  onClose: () => void;
  onSubmit: (text: string) => void;
};

export function AdminInternalNoteModal({
  open,
  title,
  subtitle,
  label,
  placeholder,
  submitLabel,
  cancelLabel,
  initialValue = "",
  onClose,
  onSubmit,
}: AdminInternalNoteModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [note, setNote] = useState(initialValue);

  const canSubmit = note.trim().length > 0;

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

  useEffect(() => {
    if (open) {
      setNote(initialValue);
    }
  }, [open, initialValue]);

  if (!open) {
    return null;
  }

  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }

    onSubmit(note.trim());
    onClose();
  };

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
        role="dialog"
        aria-modal="true"
        aria-labelledby="internal-note-title"
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="space-y-1">
          <h3
            id="internal-note-title"
            className="text-xl font-bold font-satoshi text-[#2F2F2F]"
          >
            {title}
          </h3>
          <p className="text-sm font-medium font-satoshi text-[#676565]">{subtitle}</p>
        </div>

        <div className="mt-6">
          <label className="block space-y-2">
            <span className="text-sm font-bold font-satoshi text-[#2F2F2F]">{label}</span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={5}
              placeholder={placeholder}
              className="w-full resize-y rounded-lg border border-[#E5E5E5] bg-white px-4 py-3 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none focus:border-[#135391]"
            />
          </label>
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
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-[#135391] px-5 text-sm font-bold font-satoshi text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
