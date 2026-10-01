"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal, useFormStatus } from "react-dom";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";

import { useTranslation } from "@/hooks/use-translation";

type SignOutAction = () => Promise<void>;

type SignOutConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  // The realm's sign-out server action (customer, vendor or admin).
  action: SignOutAction;
};

// "Log out of SynkAfrica?" confirmation. Controlled, and portalled to <body>
// so it survives the dropdown menu that opened it closing on outside click.
export function SignOutConfirmDialog({
  open,
  onClose,
  action,
}: SignOutConfirmDialogProps) {
  if (!open) return null;
  return createPortal(
    <SignOutDialogBody onClose={onClose} action={action} />,
    document.body,
  );
}

function SignOutDialogBody({
  onClose,
  action,
}: Omit<SignOutConfirmDialogProps, "open">) {
  const t = useTranslation();
  const queryClient = useQueryClient();
  const titleId = useId();
  const bodyId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [submitting, setSubmitting] = useState(false);

  // Focus Cancel on open (the safe choice), hand focus back on close.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();
    return () => previous?.focus?.();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, submitting]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) onClose();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#DD2222]/10 text-[#DD2222]">
          <LogOut className="h-5 w-5" aria-hidden="true" />
        </div>
        <h2
          id={titleId}
          className="mt-4 text-lg font-bold font-satoshi text-[#2F2F2F]"
        >
          {t("common.signOutConfirmTitle")}
        </h2>
        <p
          id={bodyId}
          className="mt-1 text-sm font-medium font-satoshi text-[#676565]"
        >
          {t("common.signOutConfirmBody")}
        </p>
        <form
          action={action}
          // Drop cached per-user data (bookings, profile…) before the session ends.
          onSubmit={() => {
            setSubmitting(true);
            queryClient.clear();
          }}
          className="mt-6 flex justify-end gap-3"
        >
          <button
            ref={cancelRef}
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="h-10 rounded-lg border border-[#E5E5E5] px-4 text-sm font-bold font-satoshi text-[#2F2F2F] hover:bg-[#F5F5F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#135391] disabled:opacity-60"
          >
            {t("common.cancel")}
          </button>
          <ConfirmButton label={t("vendor.nav.logOut")} pendingLabel={t("common.signingOut")} />
        </form>
      </div>
    </div>
  );
}

function ConfirmButton({
  label,
  pendingLabel,
}: {
  label: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-10 rounded-lg bg-[#DD2222] px-4 text-sm font-bold font-satoshi text-white hover:bg-[#C41E1E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DD2222] focus-visible:ring-offset-2 disabled:opacity-60"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

type SignOutConfirmButtonProps = {
  action: SignOutAction;
  className?: string;
  children: ReactNode;
};

// A sign-out button that asks first. For triggers that stay mounted
// (sidebars, account pages); menus use SignOutConfirmDialog directly.
export function SignOutConfirmButton({
  action,
  className,
  children,
}: SignOutConfirmButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className={className}
      >
        {children}
      </button>
      <SignOutConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        action={action}
      />
    </>
  );
}
