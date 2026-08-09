"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  adminInviteAdmin,
  adminListInvites,
  adminListTeam,
  adminRevokeInvite,
  INVITABLE_ADMIN_ROLES,
  type AdminRole,
  type InvitableAdminRole,
} from "@/lib/api/admin";

const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "Super admin",
  support: "Support",
  finance: "Finance",
  pricing: "Pricing",
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function AdminTeamContent() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const queryClient = useQueryClient();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InvitableAdminRole>("support");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: admins = [] } = useQuery({
    queryKey: ["admin-team"],
    queryFn: () => adminListTeam(token as string),
    enabled: Boolean(token),
    refetchOnWindowFocus: false,
  });
  const { data: invites = [] } = useQuery({
    queryKey: ["admin-invites"],
    queryFn: () => adminListInvites(token as string),
    enabled: Boolean(token),
    refetchOnWindowFocus: false,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-invites"] });
    queryClient.invalidateQueries({ queryKey: ["admin-team"] });
  };

  const inviteMutation = useMutation({
    mutationFn: () =>
      adminInviteAdmin(token as string, { email: email.trim(), role }),
    onSuccess: (invite) => {
      setInviteLink(invite.acceptUrl);
      setCopied(false);
      setEmail("");
      invalidate();
    },
  });
  const revokeMutation = useMutation({
    mutationFn: (id: string) => adminRevokeInvite(token as string, id),
    onSuccess: invalidate,
  });

  const handleCopy = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-satoshi text-[#2F2F2F]">Team</h1>
        <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
          Invite and manage admin users.
        </p>
      </div>

      {/* Invite form */}
      <section className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold font-satoshi text-[#2F2F2F]">
          Invite an admin
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (email.trim() && !inviteMutation.isPending) inviteMutation.mutate();
          }}
          className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <label className="flex-1">
            <span className="text-xs font-semibold font-satoshi text-[#676565]">
              Email
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ops@synkafrica.com"
              className="mt-1 h-11 w-full rounded-lg border border-[#E5E5E5] px-3 text-sm font-satoshi outline-none focus:border-[#135391]"
            />
          </label>
          <label className="sm:w-44">
            <span className="text-xs font-semibold font-satoshi text-[#676565]">
              Role
            </span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as InvitableAdminRole)}
              className="mt-1 h-11 w-full rounded-lg border border-[#E5E5E5] px-3 text-sm font-satoshi outline-none focus:border-[#135391]"
            >
              {INVITABLE_ADMIN_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            disabled={!email.trim() || inviteMutation.isPending}
            className="h-11 shrink-0 rounded-lg bg-[#135391] px-5 text-sm font-bold font-satoshi text-white disabled:opacity-60"
          >
            {inviteMutation.isPending ? "Sending…" : "Send invite"}
          </button>
        </form>

        {inviteMutation.isError ? (
          <p className="mt-3 text-xs font-medium font-satoshi text-[#C0392B]">
            Couldn&apos;t send the invite. That email may already be an admin.
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
                className="h-9 flex-1 rounded-md border border-[#E5E5E5] bg-white px-2 text-xs font-satoshi text-[#2F2F2F]"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="h-9 shrink-0 rounded-md border border-[#135391] px-3 text-xs font-bold font-satoshi text-[#135391]"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        ) : null}
      </section>

      {/* Pending invites */}
      {invites.length > 0 ? (
        <section className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold font-satoshi text-[#2F2F2F]">
            Pending invites
          </h2>
          <div className="mt-4 space-y-2">
            {invites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-[#EEEEEE] px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold font-satoshi text-[#2F2F2F]">
                    {invite.email}
                  </p>
                  <p className="mt-0.5 text-xs font-medium font-satoshi text-[#676565]">
                    {ROLE_LABELS[invite.role]} ·{" "}
                    {invite.expired
                      ? "Expired"
                      : `Expires ${formatDate(invite.expiresAt)}`}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={revokeMutation.isPending}
                  onClick={() => revokeMutation.mutate(invite.id)}
                  className="shrink-0 text-xs font-bold font-satoshi text-[#C0392B] hover:underline disabled:opacity-60"
                >
                  Revoke
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Admins */}
      <section className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold font-satoshi text-[#2F2F2F]">
          Admins ({admins.length})
        </h2>
        <div className="mt-4 space-y-2">
          {admins.map((admin) => (
            <div
              key={admin.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-[#EEEEEE] px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-bold font-satoshi text-[#2F2F2F]">
                  {admin.email}
                </p>
                <p className="mt-0.5 text-xs font-medium font-satoshi text-[#676565]">
                  {ROLE_LABELS[admin.role]}
                  {admin.disabledAt ? " · Disabled" : ""}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold font-satoshi ${
                  admin.mfaEnrolled
                    ? "bg-[#E7F6EC] text-[#2E7D32]"
                    : "bg-[#FFF4E5] text-[#9A7200]"
                }`}
              >
                {admin.mfaEnrolled ? "MFA on" : "MFA pending"}
              </span>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}
