"use client";

import { useMemo, useState } from "react";
import { Check, Copy, MailPlus, ShieldCheck, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  adminInviteAdmin,
  adminListInvites,
  adminListTeam,
  adminRevokeInvite,
  INVITABLE_ADMIN_ROLES,
  type AdminInvite,
  type AdminRole,
  type AdminTeamMember,
  type InvitableAdminRole,
} from "@/lib/api/admin";
import { disableAdminUser, enableAdminUser } from "@/lib/api/admin/users";
import { getAdminMe } from "@/lib/api/admin-auth";
import { LIVE_QUERY_OPTIONS } from "@/lib/live-query-options";
import {
  AdminPageHeader,
  ConfirmDialog,
  EmptyState,
  ErrorBanner,
  FieldError,
  Pagination,
  ResultCount,
  SearchInput,
  SkeletonList,
  errorMessage,
  focusRing,
  formatDate,
  formatDateTime,
  useAdminToast,
  usePagedItems,
  useUrlSearch,
  useUrlState,
} from "@/features/admin/components/admin-ui";

const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "Super admin",
  support: "Support",
  finance: "Finance",
  pricing: "Pricing",
};

const ROLE_HINTS: Record<InvitableAdminRole, string> = {
  support: "Support tickets, bookings and users",
  finance: "Payouts, refunds and bookings",
  pricing: "Packages, deals and markups",
};

const ROLE_FILTERS = ["all", "super_admin", ...INVITABLE_ADMIN_ROLES] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type PendingAction =
  | { kind: "revoke"; invite: AdminInvite }
  | { kind: "disable"; admin: AdminTeamMember };

export function AdminTeamContent() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const queryClient = useQueryClient();
  const toast = useAdminToast();
  const { get, set } = useUrlState();
  const { input, setInput, term } = useUrlSearch();
  const roleParam = get("role");
  const roleFilter = (ROLE_FILTERS as readonly string[]).includes(roleParam)
    ? roleParam
    : "all";

  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [role, setRole] = useState<InvitableAdminRole>("support");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);

  const teamQuery = useQuery({
    queryKey: ["admin-team"],
    queryFn: () => adminListTeam(token as string),
    enabled: Boolean(token),
    ...LIVE_QUERY_OPTIONS,
  });
  const invitesQuery = useQuery({
    queryKey: ["admin-invites"],
    queryFn: () => adminListInvites(token as string),
    enabled: Boolean(token),
    ...LIVE_QUERY_OPTIONS,
  });
  const admins = useMemo(() => teamQuery.data ?? [], [teamQuery.data]);
  const invites = useMemo(
    () => (invitesQuery.data ?? []).filter((i) => !i.acceptedAt),
    [invitesQuery.data],
  );

  // The signed-in admin (to hide "Disable" on your own row).
  const { data: me } = useQuery({
    queryKey: ["admin-me"],
    queryFn: () => getAdminMe(token as string),
    enabled: Boolean(token),
    refetchOnWindowFocus: false,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-invites"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-team"] });
  };

  const trimmedEmail = email.trim();
  const emailProblem = !trimmedEmail
    ? "Enter an email address."
    : !EMAIL_RE.test(trimmedEmail)
      ? "Enter a valid email address, e.g. ops@synkafrica.com."
      : admins.some((a) => a.email.toLowerCase() === trimmedEmail.toLowerCase())
        ? "This person is already an admin."
        : null;

  const inviteMutation = useMutation({
    mutationFn: () =>
      adminInviteAdmin(token as string, { email: trimmedEmail, role }),
    onSuccess: (invite) => {
      setInviteLink(invite.acceptUrl);
      setCopied(false);
      setEmail("");
      setEmailTouched(false);
      invalidate();
      toast.success(`Invite sent to ${invite.email}.`);
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (invite: AdminInvite) =>
      adminRevokeInvite(token as string, invite.id),
    onSuccess: (_d, invite) => {
      invalidate();
      setPending(null);
      toast.success(`Invite for ${invite.email} revoked.`);
    },
    onError: (err) =>
      setDialogError(errorMessage(err, "Couldn't revoke this invite.")),
  });

  // POST /admin/users/:id/disable|enable. Disabling revokes the admin's
  // sessions immediately; enabling requires them to log in again.
  const accessMutation = useMutation({
    mutationFn: (v: {
      admin: AdminTeamMember;
      action: "disable" | "enable";
    }) =>
      v.action === "disable"
        ? disableAdminUser(token as string, v.admin.id)
        : enableAdminUser(token as string, v.admin.id),
    onSuccess: (_d, v) => {
      invalidate();
      setPending(null);
      toast.success(
        v.action === "disable"
          ? `${v.admin.email} disabled and signed out.`
          : `${v.admin.email} re-enabled.`,
      );
    },
    onError: (err, v) => {
      invalidate();
      const message = errorMessage(err, "Couldn't update this admin's access.");
      if (v.action === "disable") setDialogError(message);
      else toast.error(message);
    },
  });

  const handleCopy = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success("Invite link copied.");
    } catch {
      setCopied(false);
      toast.error("Couldn't copy — select the link and copy it manually.");
    }
  };

  const filteredAdmins = useMemo(
    () =>
      admins.filter(
        (a) =>
          (roleFilter === "all" || a.role === roleFilter) &&
          (!term || a.email.toLowerCase().includes(term)),
      ),
    [admins, roleFilter, term],
  );
  const filteredInvites = useMemo(
    () =>
      invites.filter(
        (i) =>
          (roleFilter === "all" || i.role === roleFilter) &&
          (!term || i.email.toLowerCase().includes(term)),
      ),
    [invites, roleFilter, term],
  );
  const { page, pageCount, pageItems, setPage, total } =
    usePagedItems(filteredAdmins);

  const loadError = teamQuery.error ?? invitesQuery.error;
  const isLoading = teamQuery.isLoading;
  const hasFilters = roleFilter !== "all" || Boolean(term);

  return (
    <section className="space-y-6">
      <AdminPageHeader
        title="Team"
        description="Invite admins, choose what they can access, and remove access when someone leaves."
      />

      {/* Invite form */}
      <section
        aria-labelledby="invite-heading"
        className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm"
      >
        <h2
          id="invite-heading"
          className="flex items-center gap-2 text-base font-bold font-satoshi text-[#2F2F2F]"
        >
          <MailPlus className="h-4 w-4 text-[#135391]" aria-hidden="true" />
          Invite an admin
        </h2>
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            setEmailTouched(true);
            if (!emailProblem && !inviteMutation.isPending)
              inviteMutation.mutate();
          }}
          className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start"
        >
          <label className="flex-1">
            <span className="text-xs font-semibold font-satoshi text-[#676565]">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmailTouched(Boolean(email))}
              placeholder="ops@synkafrica.com"
              aria-invalid={emailTouched && Boolean(emailProblem)}
              aria-describedby="invite-email-error"
              className={`mt-1 h-11 w-full rounded-lg border px-3 text-sm font-satoshi outline-none focus:ring-2 focus:ring-[#135391]/15 ${
                emailTouched && emailProblem
                  ? "border-[#C0392B] focus:border-[#C0392B]"
                  : "border-[#E5E5E5] focus:border-[#135391]"
              }`}
            />
            <FieldError
              id="invite-email-error"
              message={emailTouched ? (emailProblem ?? undefined) : undefined}
            />
          </label>
          <label className="sm:w-56">
            <span className="text-xs font-semibold font-satoshi text-[#676565]">
              Role
            </span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as InvitableAdminRole)}
              aria-describedby="invite-role-hint"
              className={`mt-1 h-11 w-full rounded-lg border border-[#E5E5E5] px-3 text-sm font-satoshi outline-none focus:border-[#135391] ${focusRing}`}
            >
              {INVITABLE_ADMIN_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
            <span
              id="invite-role-hint"
              className="mt-1 block text-xs font-medium font-satoshi text-[#9A9A9A]"
            >
              {ROLE_HINTS[role]}
            </span>
          </label>
          <button
            type="submit"
            disabled={inviteMutation.isPending}
            className={`mt-5 h-11 shrink-0 rounded-lg bg-[#135391] px-5 text-sm font-bold font-satoshi text-white hover:opacity-90 disabled:opacity-60 ${focusRing}`}
          >
            {inviteMutation.isPending ? "Sending invite…" : "Send invite"}
          </button>
        </form>

        {inviteMutation.isError ? (
          <p
            role="alert"
            className="mt-3 text-xs font-medium font-satoshi text-[#C0392B]"
          >
            {errorMessage(
              inviteMutation.error,
              "Couldn't send the invite. That email may already be an admin.",
            )}
          </p>
        ) : null}

        {inviteLink ? (
          <div className="mt-4 rounded-lg border border-[#E7F6EC] bg-[#F3FBF5] px-4 py-3">
            <p className="text-xs font-semibold font-satoshi text-[#2E7D32]">
              Invite sent. Share this link if the email doesn&apos;t arrive:
            </p>
            <div className="mt-2 flex items-center gap-2">
              <input
                readOnly
                value={inviteLink}
                aria-label="Invite link"
                onFocus={(e) => e.currentTarget.select()}
                className="h-9 min-w-0 flex-1 rounded-md border border-[#E5E5E5] bg-white px-2 text-xs font-satoshi text-[#2F2F2F]"
              />
              <button
                type="button"
                onClick={handleCopy}
                className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-[#135391] px-3 text-xs font-bold font-satoshi text-[#135391] hover:bg-[#F0F6FC] ${focusRing}`}
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        ) : null}
      </section>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={input}
          onChange={setInput}
          placeholder="Search by email"
          label="Search admins and invites"
          className="sm:w-72"
        />
        <label className="sr-only" htmlFor="team-role">
          Role
        </label>
        <select
          id="team-role"
          value={roleFilter}
          onChange={(e) =>
            set({
              role: e.target.value === "all" ? null : e.target.value,
              page: null,
            })
          }
          className={`h-10 rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm font-medium font-satoshi outline-none focus:border-[#135391] ${focusRing}`}
        >
          {ROLE_FILTERS.map((r) => (
            <option key={r} value={r}>
              {r === "all" ? "All roles" : ROLE_LABELS[r]}
            </option>
          ))}
        </select>
        {!isLoading ? (
          <span className="sm:ml-auto">
            <ResultCount
              shown={filteredAdmins.length}
              total={admins.length}
              noun="admin"
            />
          </span>
        ) : null}
      </div>

      {loadError ? (
        <ErrorBanner
          message={errorMessage(loadError, "Couldn't load the team.")}
          onRetry={() => {
            void teamQuery.refetch();
            void invitesQuery.refetch();
          }}
          retrying={teamQuery.isFetching || invitesQuery.isFetching}
        />
      ) : null}

      {/* Pending invites */}
      {filteredInvites.length > 0 ? (
        <section
          aria-labelledby="invites-heading"
          className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm"
        >
          <h2
            id="invites-heading"
            className="text-base font-bold font-satoshi text-[#2F2F2F]"
          >
            Pending invites ({filteredInvites.length})
          </h2>
          <ul className="mt-4 space-y-2">
            {filteredInvites.map((invite) => {
              const revoking =
                revokeMutation.isPending &&
                revokeMutation.variables?.id === invite.id;
              return (
                <li
                  key={invite.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-[#EEEEEE] px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold font-satoshi text-[#2F2F2F]">
                      {invite.email}
                    </p>
                    <p className="mt-0.5 text-xs font-medium font-satoshi text-[#676565]">
                      {ROLE_LABELS[invite.role]} · Sent{" "}
                      {formatDate(invite.createdAt)} ·{" "}
                      {invite.expired ? (
                        <span className="font-semibold text-[#C0392B]">
                          Expired
                        </span>
                      ) : (
                        `Expires ${formatDate(invite.expiresAt)}`
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={revoking}
                    onClick={() => {
                      setDialogError(null);
                      setPending({ kind: "revoke", invite });
                    }}
                    aria-label={`Revoke invite for ${invite.email}`}
                    className={`shrink-0 rounded-lg border border-[#F5C2C0] px-3 py-1.5 text-xs font-bold font-satoshi text-[#C0392B] hover:bg-[#FDF2F2] disabled:opacity-60 ${focusRing}`}
                  >
                    {revoking ? "Revoking…" : "Revoke"}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {/* Admins */}
      <section
        aria-labelledby="admins-heading"
        className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm"
      >
        <h2
          id="admins-heading"
          className="text-base font-bold font-satoshi text-[#2F2F2F]"
        >
          Admins {isLoading ? "" : `(${filteredAdmins.length})`}
        </h2>
        <div className="mt-4">
          {isLoading ? (
            <SkeletonList rows={4} label="Loading admins" />
          ) : filteredAdmins.length === 0 ? (
            <EmptyState
              icon={Users}
              title={hasFilters ? "No admins match" : "No admins yet"}
              description={
                hasFilters
                  ? "Try another role or clear the search."
                  : "Invite your first teammate with the form above."
              }
            />
          ) : (
            <ul className="space-y-2">
              {pageItems.map((admin) => {
                const busy =
                  accessMutation.isPending &&
                  accessMutation.variables?.admin.id === admin.id;
                const isMe = me?.id === admin.id;
                return (
                  <li
                    key={admin.id}
                    className={`flex flex-col gap-3 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${
                      admin.disabledAt
                        ? "border-[#EEEEEE] bg-[#FAFAFA]"
                        : "border-[#EEEEEE]"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 truncate text-sm font-bold font-satoshi text-[#2F2F2F]">
                        {admin.email}
                        {isMe ? (
                          <span className="rounded-full bg-[#F0F6FC] px-2 py-0.5 text-[10px] font-semibold text-[#135391]">
                            You
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-0.5 text-xs font-medium font-satoshi text-[#676565]">
                        {admin.isSuperAdmin ? (
                          <ShieldCheck
                            className="mr-1 inline h-3 w-3 text-[#135391]"
                            aria-hidden="true"
                          />
                        ) : null}
                        {ROLE_LABELS[admin.role]} · Last sign-in{" "}
                        {admin.lastLoginAt
                          ? formatDateTime(admin.lastLoginAt)
                          : "never"}
                        {admin.disabledAt ? (
                          <span className="font-semibold text-[#C0392B]">
                            {" "}
                            · Disabled {formatDate(admin.disabledAt)}
                          </span>
                        ) : null}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold font-satoshi ${
                          admin.mfaEnrolled
                            ? "bg-[#E7F6EC] text-[#2E7D32]"
                            : "bg-[#FFF4E5] text-[#9A7200]"
                        }`}
                      >
                        {admin.mfaEnrolled ? "MFA on" : "MFA pending"}
                      </span>
                      {me && !isMe ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => {
                            if (admin.disabledAt) {
                              accessMutation.mutate({
                                admin,
                                action: "enable",
                              });
                            } else {
                              setDialogError(null);
                              setPending({ kind: "disable", admin });
                            }
                          }}
                          aria-label={`${admin.disabledAt ? "Enable" : "Disable"} ${admin.email}`}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-bold font-satoshi disabled:opacity-60 ${focusRing} ${
                            admin.disabledAt
                              ? "border-[#BFE5CB] text-[#2E7D32] hover:bg-[#F3FBF5]"
                              : "border-[#F5C2C0] text-[#C0392B] hover:bg-[#FDF2F2]"
                          }`}
                        >
                          {busy
                            ? admin.disabledAt
                              ? "Enabling…"
                              : "Disabling…"
                            : admin.disabledAt
                              ? "Enable"
                              : "Disable"}
                        </button>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="mt-4">
            <Pagination
              page={page}
              pageCount={pageCount}
              total={total}
              onPage={setPage}
            />
          </div>
        </div>
      </section>

      <ConfirmDialog
        open={pending?.kind === "revoke"}
        title="Revoke this invite?"
        message={
          pending?.kind === "revoke"
            ? `The link sent to ${pending.invite.email} will stop working immediately. You can send a new invite later.`
            : ""
        }
        confirmLabel="Revoke invite"
        pendingLabel="Revoking…"
        pending={revokeMutation.isPending}
        destructive
        error={pending?.kind === "revoke" ? dialogError : null}
        onConfirm={() => {
          if (pending?.kind === "revoke") revokeMutation.mutate(pending.invite);
        }}
        onClose={() => setPending(null)}
      />
      <ConfirmDialog
        open={pending?.kind === "disable"}
        title="Disable this admin?"
        message={
          pending?.kind === "disable"
            ? `${pending.admin.email} will be signed out everywhere and can't sign in until re-enabled.`
            : ""
        }
        confirmLabel="Disable admin"
        pendingLabel="Disabling…"
        pending={accessMutation.isPending}
        destructive
        error={pending?.kind === "disable" ? dialogError : null}
        onConfirm={() => {
          if (pending?.kind === "disable")
            accessMutation.mutate({ admin: pending.admin, action: "disable" });
        }}
        onClose={() => setPending(null)}
      />
    </section>
  );
}
