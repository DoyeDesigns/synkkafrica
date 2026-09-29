"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  adminBlockCustomer,
  adminListCustomers,
  adminUnblockCustomer,
  type AdminCustomer,
} from "@/lib/api/admin";
import { LIVE_QUERY_OPTIONS } from "@/lib/live-query-options";

const STATUS_FILTERS = ["all", "active", "blocked"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const REASON_MIN = 3;
const REASON_MAX = 500;

type PendingAction = { kind: "block" | "unblock"; customer: AdminCustomer };

function displayName(c: AdminCustomer) {
  return [c.firstName, c.lastName].filter(Boolean).join(" ") || c.email;
}

function errorMessage(err: unknown) {
  return err instanceof Error && err.message
    ? err.message
    : "Something went wrong. Please try again.";
}

export function AdminUsersLiveContent() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [action, setAction] = useState<PendingAction | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: () => adminListCustomers(token as string),
    enabled: Boolean(token),
    ...LIVE_QUERY_OPTIONS,
  });

  const onSuccess = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
    setAction(null);
  };

  const blockMutation = useMutation({
    mutationFn: (v: { id: string; reason: string }) =>
      adminBlockCustomer(token as string, v.id, v.reason),
    onSuccess,
  });
  const unblockMutation = useMutation({
    mutationFn: (id: string) => adminUnblockCustomer(token as string, id),
    onSuccess,
  });

  const customers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? []).filter((c) => {
      if (status === "blocked" && !c.disabledAt) return false;
      if (status === "active" && c.disabledAt) return false;
      if (!q) return true;
      return (
        c.email.toLowerCase().includes(q) ||
        `${c.firstName ?? ""} ${c.lastName ?? ""}`.toLowerCase().includes(q)
      );
    });
  }, [data, query, status]);

  const busyId = blockMutation.isPending
    ? blockMutation.variables?.id
    : unblockMutation.isPending
      ? unblockMutation.variables
      : undefined;

  const openAction = (next: PendingAction) => {
    blockMutation.reset();
    unblockMutation.reset();
    setAction(next);
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-satoshi text-[#2F2F2F]">
          Customers
        </h1>
        <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
          Registered customer accounts.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email"
          className="h-11 w-full max-w-sm rounded-lg border border-[#E5E5E5] px-3 text-sm font-satoshi outline-none focus:border-[#135391]"
        />
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold font-satoshi capitalize transition-colors ${
                status === s
                  ? "bg-[#135391] text-white"
                  : "border border-[#E5E5E5] bg-white text-[#676565] hover:bg-[#F5F5F5]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm font-medium font-satoshi text-[#676565]">
          Loading…
        </p>
      ) : customers.length === 0 ? (
        <p className="rounded-lg border border-[#EEEEEE] bg-[#FAFAFA] px-4 py-6 text-center text-sm font-medium font-satoshi text-[#676565]">
          No customers found.
        </p>
      ) : (
        <div className="space-y-3">
          {customers.map((c) => {
            const blocked = Boolean(c.disabledAt);
            const busy = busyId === c.id;
            return (
              <div
                key={c.id}
                className="flex flex-col gap-3 rounded-xl border border-[#EEEEEE] bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold font-satoshi text-[#2F2F2F]">
                    {[c.firstName, c.lastName].filter(Boolean).join(" ") ||
                      "—"}
                  </p>
                  <p className="mt-0.5 truncate text-xs font-medium font-satoshi text-[#676565]">
                    {c.email}
                    {c.phoneNumber ? ` · ${c.phoneNumber}` : ""}
                  </p>
                  {blocked && c.disabledReason ? (
                    <p className="mt-1 break-words text-xs font-medium font-satoshi text-[#C0392B]">
                      Blocked
                      {c.disabledAt
                        ? ` on ${new Date(c.disabledAt).toLocaleDateString()}`
                        : ""}
                      : {c.disabledReason}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {blocked ? (
                    <span
                      title={c.disabledReason ?? undefined}
                      className="rounded-full bg-[#FDEBEB] px-3 py-1 text-xs font-semibold font-satoshi text-[#C0392B]"
                    >
                      Blocked
                    </span>
                  ) : (
                    <span className="rounded-full bg-[#E7F6EC] px-3 py-1 text-xs font-semibold font-satoshi text-[#2E7D32]">
                      Active
                    </span>
                  )}
                  {c.deleted ? (
                    <span className="rounded-full bg-[#FDEBEB] px-3 py-1 text-xs font-semibold font-satoshi text-[#C0392B]">
                      Deleted
                    </span>
                  ) : c.emailVerified ? (
                    <span className="rounded-full bg-[#E7F6EC] px-3 py-1 text-xs font-semibold font-satoshi text-[#2E7D32]">
                      Verified
                    </span>
                  ) : (
                    <span className="rounded-full bg-[#FFF4E5] px-3 py-1 text-xs font-semibold font-satoshi text-[#9A7200]">
                      Unverified
                    </span>
                  )}
                  {blocked ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        openAction({ kind: "unblock", customer: c })
                      }
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-[#E5E5E5] px-4 text-xs font-bold font-satoshi text-[#2F2F2F] transition-colors hover:bg-[#FAFAFA] disabled:opacity-60"
                    >
                      {busy ? "Unblocking…" : "Unblock"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => openAction({ kind: "block", customer: c })}
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-[#F5C2C2] px-4 text-xs font-bold font-satoshi text-[#DD2222] transition-colors hover:bg-[#FDEBEB] disabled:opacity-60"
                    >
                      {busy ? "Blocking…" : "Block"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {action ? (
        <CustomerActionDialog
          key={`${action.kind}-${action.customer.id}`}
          action={action}
          pending={blockMutation.isPending || unblockMutation.isPending}
          error={
            action.kind === "block"
              ? blockMutation.error
                ? errorMessage(blockMutation.error)
                : null
              : unblockMutation.error
                ? errorMessage(unblockMutation.error)
                : null
          }
          onClose={() => setAction(null)}
          onConfirm={(reason) => {
            if (action.kind === "block") {
              blockMutation.mutate({ id: action.customer.id, reason });
            } else {
              unblockMutation.mutate(action.customer.id);
            }
          }}
        />
      ) : null}
    </section>
  );
}

type CustomerActionDialogProps = {
  action: PendingAction;
  pending: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: (reason: string) => void;
};

function CustomerActionDialog({
  action,
  pending,
  error,
  onClose,
  onConfirm,
}: CustomerActionDialogProps) {
  const [reason, setReason] = useState("");
  const isBlock = action.kind === "block";
  const trimmed = reason.trim();
  const reasonValid =
    trimmed.length >= REASON_MIN && trimmed.length <= REASON_MAX;
  const name = displayName(action.customer);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !pending) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pending, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget && !pending) onClose();
      }}
    >
      <form
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="customer-action-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onSubmit={(event) => {
          event.preventDefault();
          if (pending || (isBlock && !reasonValid)) return;
          onConfirm(trimmed);
        }}
      >
        <h3
          id="customer-action-title"
          className="text-xl font-bold font-satoshi text-[#2F2F2F]"
        >
          {isBlock ? "Block customer?" : "Unblock customer?"}
        </h3>
        <p className="mt-2 text-sm font-medium font-satoshi leading-relaxed text-[#676565]">
          {isBlock
            ? `${name} will be signed out everywhere and won't be able to sign in or use their account until unblocked. Guest checkout by email is not affected.`
            : `${name} will be able to sign in again. They'll need to sign in afresh — previous sessions stay revoked.`}
        </p>

        {isBlock ? (
          <div className="mt-4">
            <label
              htmlFor="block-reason"
              className="text-xs font-semibold font-satoshi text-[#2F2F2F]"
            >
              Reason (required, recorded in the audit log)
            </label>
            <textarea
              id="block-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={REASON_MAX}
              rows={3}
              autoFocus
              disabled={pending}
              placeholder="e.g. Repeated chargeback fraud"
              className="mt-1 w-full rounded-lg border border-[#E5E5E5] px-3 py-2 text-sm font-satoshi outline-none focus:border-[#135391] disabled:opacity-60"
            />
            <p className="mt-1 text-right text-[11px] font-medium font-satoshi text-[#9E9E9E]">
              {trimmed.length}/{REASON_MAX}
              {trimmed.length > 0 && trimmed.length < REASON_MIN
                ? ` · at least ${REASON_MIN} characters`
                : ""}
            </p>
          </div>
        ) : null}

        {error ? (
          <p className="mt-3 rounded-lg bg-[#FDEBEB] px-3 py-2 text-xs font-medium font-satoshi text-[#C0392B]">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-[#E5E5E5] px-5 text-sm font-bold font-satoshi text-[#2F2F2F] transition-colors hover:bg-[#FAFAFA] disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending || (isBlock && !reasonValid)}
            className={`inline-flex h-11 items-center justify-center rounded-lg px-5 text-sm font-bold font-satoshi text-white transition-opacity hover:opacity-90 disabled:opacity-60 ${
              isBlock ? "bg-[#DD2222]" : "bg-[#135391]"
            }`}
          >
            {pending
              ? isBlock
                ? "Blocking…"
                : "Unblocking…"
              : isBlock
                ? "Block customer"
                : "Unblock customer"}
          </button>
        </div>
      </form>
    </div>
  );
}
