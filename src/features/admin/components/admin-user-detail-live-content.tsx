"use client";

import Link from "next/link";
import { ArrowLeft, Copy, Mail, MoreVertical, Power, RotateCcw } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { adminBlockCustomer, adminUnblockCustomer } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/backend";
import { adminGetCustomer, type AdminCustomerBooking, type AdminCustomerDetail } from "@/lib/api/admin/customers";
import { useTranslation } from "@/hooks/use-translation";
import { LIVE_QUERY_OPTIONS } from "@/lib/live-query-options";
import { displayCustomerName } from "@/features/admin/components/admin-users-live-content";
import {
  ConfirmDialog,
  DetailCard,
  DetailRow,
  ErrorBanner,
  MenuDivider,
  MenuItem,
  MenuSection,
  MetricCard,
  NoticeBanner,
  Skeleton,
  errorMessage,
  focusRing,
  formatAmounts,
  formatDate,
  formatMoney,
  formatRelative,
  shortId,
  useDismiss,
  useNotice,
  useUrlState,
  type ConfirmConfig,
} from "@/features/admin/components/admin-people-kit";

const KIND_LABELS: Record<AdminCustomerBooking["kind"], string> = {
  flight: "Flight",
  car: "Car rental",
  accommodation: "Stay",
  experience: "Experience",
  other: "Booking",
};

// Vendor booking statuses + flight states → label and badge style.
function bookingStatus(status: string): { label: string; className: string } {
  const s = status.toLowerCase();
  if (["confirmed", "ticketed", "pnr_created", "payment_confirmed"].includes(s))
    return { label: s === "ticketed" ? "Ticketed" : "Confirmed", className: "bg-[#E8F5E9] text-[#2E7D32]" };
  if (s === "completed") return { label: "Completed", className: "bg-[#E3F2FD] text-[#1565C0]" };
  if (["cancelled", "declined", "refunded"].includes(s))
    return { label: s.charAt(0).toUpperCase() + s.slice(1), className: "bg-[#F5F5F5] text-[#676565]" };
  if (s === "awaiting_confirmation") return { label: "Awaiting vendor", className: "bg-[#FFF3E0] text-[#E65100]" };
  if (s.includes("fail")) return { label: "Failed", className: "bg-[#FDEBEB] text-[#C0392B]" };
  if (s.includes("refund")) return { label: "Refund in progress", className: "bg-[#FFF3E0] text-[#E65100]" };
  return {
    label: s.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase()),
    className: "bg-[#E8EAF6] text-[#3949AB]",
  };
}

// 404 for unknown / erased customers, 400 for a malformed id in the URL.
function isNotFound(err: unknown) {
  return err instanceof ApiError && (err.status === 404 || err.status === 400);
}

const TICKET_STATUS: Record<string, string> = {
  open: "bg-[#FFF3E0] text-[#E65100]",
  in_progress: "bg-[#E8EAF6] text-[#3949AB]",
  resolved: "bg-[#E8F5E9] text-[#2E7D32]",
  closed: "bg-[#F5F5F5] text-[#676565]",
};

export function AdminUserDetailLiveContent({ userId }: { userId: string }) {
  const t = useTranslation();
  const { data: session } = useSession();
  const token = session?.accessToken;
  const queryClient = useQueryClient();
  const { get } = useUrlState();
  const back = get("back");
  const backHref = back ? `/admin/users?${back}` : "/admin/users";
  const { notice, setNotice, clear } = useNotice();

  const query = useQuery({
    queryKey: ["admin-customer", userId],
    queryFn: () => adminGetCustomer(token as string, userId),
    enabled: Boolean(token),
    retry: (count, err) => !isNotFound(err) && count < 2,
    ...LIVE_QUERY_OPTIONS,
  });

  const backLink = (
    <Link
      href={backHref}
      className={`inline-flex items-center gap-1.5 rounded text-sm font-bold font-satoshi text-[#135391] hover:underline ${focusRing}`}
    >
      <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
      {t("admin.users.backToList")}
    </Link>
  );

  if (query.isError && isNotFound(query.error)) {
    return (
      <div className="space-y-6">
        {backLink}
        <div className="rounded-xl border border-[#EEEEEE] bg-white p-10 text-center shadow-sm">
          <p className="text-sm font-medium font-satoshi text-[#676565]">{t("admin.users.notFound")}</p>
        </div>
      </div>
    );
  }

  const user = query.data;
  const loading = !user && !query.isError;

  return (
    <div className="space-y-6">
      {backLink}

      {query.isError ? (
        <ErrorBanner
          message={errorMessage(query.error, "Couldn't load this customer.")}
          onRetry={() => void query.refetch()}
          retrying={query.isFetching}
        />
      ) : null}

      <NoticeBanner notice={notice} onDismiss={clear} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard loading={loading} value={String(user?.bookingsCount ?? 0)} label={t("admin.users.detail.totalBookings")} />
        <MetricCard
          loading={loading}
          value={formatAmounts(user?.spend ?? [], formatMoney(0, "NGN"))}
          label={t("admin.users.detail.lifetimeSpend")}
        />
        <MetricCard loading={loading} value={String(user?.openTickets ?? 0)} label={t("admin.users.detail.openTickets")} />
        <MetricCard loading={loading} value={String(user?.reviewsCount ?? 0)} label="Reviews written" />
      </div>

      {user ? (
        <>
          <ProfileHeader
            user={user}
            onDone={async (message) => {
              setNotice({ tone: "success", message });
              await queryClient.invalidateQueries({ queryKey: ["admin-customer", userId] });
              await queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
            }}
            onCopied={() => setNotice({ tone: "success", message: "Email address copied." })}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <DetailCard title="Account & verification">
              <DetailRow
                label="Email address"
                value={user.emailVerified ? t("admin.users.detail.verified") : t("admin.users.detail.notVerified")}
                badgeTone={user.emailVerified ? "verified" : "notVerified"}
              />
              <DetailRow
                label="Account access"
                value={user.disabledAt ? `Disabled ${formatDate(user.disabledAt)}` : "Active"}
                badgeTone={user.disabledAt ? "failed" : "verified"}
              />
              {user.disabledAt && user.disabledReason ? (
                <DetailRow label="Reason disabled" value={user.disabledReason} />
              ) : null}
              <DetailRow
                label="Data deletion"
                value={
                  user.deleted
                    ? "Deletion requested"
                    : user.erasureRequestedAt
                      ? `Requested ${formatDate(user.erasureRequestedAt)}`
                      : "None requested"
                }
                badgeTone={user.deleted || user.erasureRequestedAt ? "warning" : "notVerified"}
              />
              <DetailRow label="Last sign-in" value={user.lastSignInAt ? formatDate(user.lastSignInAt) : "Never"} />
            </DetailCard>

            <DetailCard title="Spend">
              <DetailRow label={t("admin.users.detail.defaultCurrency")} value={user.spend[0]?.currency ?? "—"} />
              {user.spend.length > 0 ? (
                user.spend.map((s) => (
                  <DetailRow key={s.currency} label={`Lifetime spend (${s.currency})`} value={formatMoney(s.amount, s.currency)} />
                ))
              ) : (
                <DetailRow label={t("admin.users.detail.lifetimeSpend")} value={formatMoney(0, "NGN")} />
              )}
              <DetailRow label="Last booking" value={formatDate(user.lastBookingAt)} />
            </DetailCard>
          </div>

          <BookingHistory bookings={user.bookings} />

          <DetailCard title="Support tickets">
            {user.tickets.length === 0 ? (
              <p className="py-2 text-sm font-medium text-[#676565]">No support tickets from this customer.</p>
            ) : (
              <ul className="divide-y divide-dotted divide-[#E0E0E0]">
                {user.tickets.map((ticket) => (
                  <li key={ticket.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold font-satoshi text-[#2F2F2F]">
                        #{ticket.reference} · {ticket.subject}
                      </p>
                      <p className="text-xs font-medium text-[#676565]">Opened {formatDate(ticket.createdAt)}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${TICKET_STATUS[ticket.status] ?? TICKET_STATUS.closed}`}
                    >
                      {ticket.status.replace("_", " ")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </DetailCard>
        </>
      ) : loading ? (
        <div className="space-y-6" aria-busy="true" aria-label="Loading customer">
          <div className="rounded-xl border border-[#EEEEEE] bg-white p-6 shadow-sm">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="mt-4 h-4 w-80 max-w-full" />
            <Skeleton className="mt-2 h-4 w-64 max-w-full" />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {[0, 1].map((i) => (
              <div key={i} className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm">
                <Skeleton className="h-5 w-40" />
                {[0, 1, 2].map((r) => (
                  <Skeleton key={r} className="mt-4 h-4 w-full" />
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ProfileHeader({
  user,
  onDone,
  onCopied,
}: {
  user: AdminCustomerDetail;
  onDone: (message: string) => Promise<void>;
  onCopied: () => void;
}) {
  const t = useTranslation();
  const { data: session } = useSession();
  const token = session?.accessToken;
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirm, setConfirm] = useState<"block" | "unblock" | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  useDismiss(menuRef, menuOpen, closeMenu);

  const name = displayCustomerName(user);
  const blocked = Boolean(user.disabledAt);

  const mutation = useMutation({
    mutationFn: (v: { kind: "block" | "unblock"; reason: string }) =>
      v.kind === "block"
        ? adminBlockCustomer(token as string, user.id, v.reason)
        : adminUnblockCustomer(token as string, user.id),
    onSuccess: async (_r, v) => {
      setConfirm(null);
      await onDone(v.kind === "block" ? `${name} has been disabled and signed out.` : `${name} can sign in again.`);
    },
  });

  const config: ConfirmConfig | null = useMemo(() => {
    if (confirm === "block")
      return {
        title: `Disable ${name}?`,
        message: `${name} (${user.email}) will be signed out everywhere and won't be able to sign in until re-enabled. Guest checkout by email is not affected.`,
        confirmLabel: "Disable account",
        pendingLabel: "Disabling…",
        tone: "danger",
        reason: {
          label: "Reason (required, recorded in the audit log)",
          placeholder: "e.g. Repeated chargeback fraud",
          required: true,
          min: 3,
          max: 500,
        },
      };
    if (confirm === "unblock")
      return {
        title: `Re-enable ${name}?`,
        message: `${name} (${user.email}) will be able to sign in again. Previous sessions stay revoked.`,
        confirmLabel: "Enable account",
        pendingLabel: "Enabling…",
        tone: "primary",
      };
    return null;
  }, [confirm, name, user.email]);

  return (
    <div className="rounded-xl border border-[#EEEEEE] bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold font-satoshi text-[#2F2F2F]">{name}</h2>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                blocked ? "bg-[#FDEBEB] text-[#C0392B]" : "bg-[#E8F5E9] text-[#2E7D32]"
              }`}
            >
              {blocked ? "Disabled" : t("admin.users.status.active")}
            </span>
            {user.emailVerified ? (
              <span className="rounded-full bg-[#E3F2FD] px-2.5 py-1 text-xs font-semibold text-[#1565C0]">Email verified</span>
            ) : null}
          </div>

          <p className="mt-3 text-sm font-medium font-satoshi text-[#676565]">
            {t("admin.users.userId")}: <span title={user.id}>{shortId(user.id)}</span> &bull;{" "}
            {t("admin.users.detail.joined", { date: formatDate(user.createdAt) })}
            {user.lastSignInAt ? (
              <>
                {" "}
                &bull; {t("admin.users.detail.lastActive", { elapsed: formatRelative(user.lastSignInAt) })}
              </>
            ) : null}
          </p>
          <p className="mt-1 break-words text-sm font-medium font-satoshi text-[#676565]">
            {user.email}
            {user.phoneNumber ? <> &bull; {user.phoneNumber}</> : null}
          </p>
          {blocked && user.disabledReason ? (
            <p className="mt-2 text-sm font-medium font-satoshi text-[#C0392B]">Disabled: {user.disabledReason}</p>
          ) : null}
        </div>

        <div ref={menuRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-label={`Actions for ${name}`}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#676565] transition-colors hover:bg-[#F5F5F5] ${focusRing}`}
          >
            <MoreVertical className="h-4 w-4" aria-hidden />
          </button>

          {menuOpen ? (
            <div
              role="menu"
              className="absolute right-0 top-full z-20 mt-1 w-64 overflow-hidden rounded-lg border border-[#EEEEEE] bg-white py-2 shadow-lg"
            >
              <MenuSection title={t("admin.users.menu.support")}>
                <MenuItem icon={Mail} label="Email customer" href={`mailto:${user.email}`} onClick={closeMenu} />
                <MenuItem
                  icon={Copy}
                  label="Copy email address"
                  onClick={() => {
                    closeMenu();
                    void navigator.clipboard?.writeText(user.email).then(onCopied, () => undefined);
                  }}
                />
              </MenuSection>
              <MenuDivider />
              <MenuSection title={t("admin.users.menu.dataAccount")}>
                {blocked ? (
                  <MenuItem
                    icon={RotateCcw}
                    label="Re-enable account"
                    onClick={() => {
                      closeMenu();
                      mutation.reset();
                      setConfirm("unblock");
                    }}
                  />
                ) : (
                  <MenuItem
                    icon={Power}
                    label={t("admin.users.menu.suspendAccount")}
                    destructive
                    disabled={user.deleted}
                    onClick={() => {
                      closeMenu();
                      mutation.reset();
                      setConfirm("block");
                    }}
                  />
                )}
              </MenuSection>
            </div>
          ) : null}
        </div>
      </div>

      {config && confirm ? (
        <ConfirmDialog
          key={confirm}
          config={config}
          pending={mutation.isPending}
          error={mutation.error ? errorMessage(mutation.error) : null}
          onClose={() => setConfirm(null)}
          onConfirm={(reason) => mutation.mutate({ kind: confirm, reason })}
        />
      ) : null}
    </div>
  );
}

function BookingHistory({ bookings }: { bookings: AdminCustomerBooking[] }) {
  const t = useTranslation();
  return (
    <DetailCard title={`${t("admin.users.detail.recentBookings")} (${bookings.length})`}>
      {bookings.length === 0 ? (
        <p className="py-2 text-sm font-medium text-[#676565]">This customer hasn&apos;t made a paid booking yet.</p>
      ) : (
        <div className="-mx-5 max-h-[480px] overflow-auto">
          <table className="w-full min-w-[720px] text-left text-sm font-satoshi">
            <thead className="sticky top-0 bg-[#FAFAFA] text-xs font-semibold uppercase text-[#676565]">
              <tr>
                <th scope="col" className="px-5 py-2.5">Booking</th>
                <th scope="col" className="px-5 py-2.5">Type</th>
                <th scope="col" className="px-5 py-2.5">Service date</th>
                <th scope="col" className="px-5 py-2.5">Booked</th>
                <th scope="col" className="px-5 py-2.5 text-right">Amount</th>
                <th scope="col" className="px-5 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F0F0]">
              {bookings.map((b) => {
                const st = bookingStatus(b.status);
                return (
                  <tr key={`${b.kind}-${b.id}`}>
                    <td className="px-5 py-3">
                      {b.listingId ? (
                        <Link
                          href={`/admin/listings/${b.listingId}`}
                          className={`font-semibold text-[#135391] hover:underline ${focusRing}`}
                        >
                          {b.title}
                        </Link>
                      ) : (
                        <span className="font-semibold text-[#2F2F2F]">{b.title}</span>
                      )}
                      <p className="font-mono text-xs text-[#676565]">{b.reference}</p>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-[#676565]">{KIND_LABELS[b.kind]}</td>
                    <td className="px-5 py-3 whitespace-nowrap text-[#676565]">{formatDate(b.serviceDate)}</td>
                    <td className="px-5 py-3 whitespace-nowrap text-[#676565]">{formatDate(b.createdAt)}</td>
                    <td className="px-5 py-3 text-right font-semibold whitespace-nowrap text-[#2F2F2F] tabular-nums">
                      {formatMoney(b.amount, b.currency)}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${st.className}`}>
                        {st.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </DetailCard>
  );
}
