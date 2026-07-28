"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Mars,
  Pencil,
  Phone,
  User,
  X,
} from "lucide-react";
import type { Session } from "next-auth";

import {
  AccountField,
  accountInputClassName,
} from "@/features/account/components/account-field";
import { FormDate } from "@/features/travel/components/booking/form-controls";
import { useTranslation } from "@/hooks/use-translation";
import { updateProfile, type UserProfile } from "@/lib/api/users";

const dateTriggerClassName =
  "flex h-11 w-full items-center rounded-[10px] border border-[#C9C9C9] bg-white px-3 text-sm font-medium font-satoshi text-foreground outline-none focus:border-[#004785]";

type AccountProfileCardProps = {
  session: Session;
  profile: UserProfile | null;
};

function splitName(full: string): { firstName: string; lastName: string } {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  const [firstName, ...rest] = parts;
  return { firstName, lastName: rest.join(" ") };
}

export function AccountProfileCard({ session, profile }: AccountProfileCardProps) {
  const t = useTranslation();
  const router = useRouter();
  const token = session.accessToken;

  const initialName =
    [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") ||
    session.user?.name ||
    "";
  const email = profile?.email ?? session.user?.email ?? "";
  const avatar = profile?.profileImageUrl ?? session.user?.image ?? null;

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(profile?.phoneNumber ?? "");
  const [dob, setDob] = useState("");

  const canEdit = Boolean(token);
  const todayISO = new Date().toISOString().slice(0, 10);

  function startEdit() {
    setError(null);
    setName(initialName);
    setPhone(profile?.phoneNumber ?? "");
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setError(null);
    setName(initialName);
    setPhone(profile?.phoneNumber ?? "");
  }

  async function save() {
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      const { firstName, lastName } = splitName(name);
      await updateProfile(token, {
        firstName,
        lastName,
        phoneNumber: phone.trim(),
      });
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save changes.");
    } finally {
      setSaving(false);
    }
  }

  const editableInput = `${accountInputClassName} pl-10 disabled:cursor-default disabled:bg-[#FAFAFA] disabled:text-foreground/80`;

  return (
    <section className="rounded-2xl border border-[#EEEEEE] bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#BDBDBD]">
          {avatar ? (
            <img
              src={avatar}
              alt=""
              className="h-full w-full rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <User className="h-12 w-12 text-white" strokeWidth={1.5} />
          )}
        </div>

        {canEdit ? (
          editing ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cancelEdit}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-[10px] border border-[#C9C9C9] px-3.5 py-2 text-sm font-medium font-satoshi text-foreground transition-colors hover:bg-black/[0.03] disabled:opacity-60"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-[10px] bg-[#004785] px-4 py-2 text-sm font-semibold font-satoshi text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" strokeWidth={2} />
                )}
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={startEdit}
              className="inline-flex items-center gap-1.5 text-sm font-medium font-satoshi text-[#004785] transition-opacity hover:opacity-80"
            >
              <Pencil className="h-4 w-4" strokeWidth={1.75} />
              {t("account.profile.edit")}
            </button>
          )
        ) : null}
      </div>

      {error ? (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <AccountField
          label={t("account.profile.fullName")}
          icon={<User className="h-4 w-4" strokeWidth={1.75} />}
        >
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!editing}
            placeholder={t("account.profile.fullNamePlaceholder")}
            className={editableInput}
          />
        </AccountField>

        <AccountField
          label={t("account.profile.location")}
          icon={<MapPin className="h-4 w-4" strokeWidth={1.75} />}
        >
          <input
            type="text"
            defaultValue="Lagos Nigeria"
            className={`${accountInputClassName} pl-10`}
          />
        </AccountField>

        <AccountField label={t("account.profile.dateOfBirth")}>
          <FormDate
            value={dob}
            onChange={setDob}
            max={todayISO}
            placeholder="Select date of birth"
            disabled={!editing}
            className={dateTriggerClassName}
          />
        </AccountField>

        <AccountField
          label={t("account.profile.gender")}
          icon={<Mars className="h-4 w-4" strokeWidth={1.75} />}
        >
          <input
            type="text"
            placeholder={t("account.profile.notAdded")}
            className={`${accountInputClassName} pl-10`}
          />
        </AccountField>
      </div>

      <div className="mt-8 border-t border-[#E8E8E8] pt-8">
        <h2 className="text-base font-bold font-montserrat text-foreground">
          {t("account.profile.contactDetails")}
        </h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <AccountField
            label={t("account.profile.phone")}
            icon={<Phone className="h-4 w-4" strokeWidth={1.75} />}
          >
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={!editing}
              placeholder="+234 801 234 5678"
              className={editableInput}
            />
          </AccountField>

          <AccountField
            label={t("account.profile.email")}
            icon={<Mail className="h-4 w-4" strokeWidth={1.75} />}
          >
            <input
              type="email"
              value={email}
              readOnly
              className={`${accountInputClassName} cursor-default bg-[#FAFAFA] pl-10 text-foreground/80`}
            />
          </AccountField>
        </div>
        {editing ? (
          <p className="mt-2 text-xs font-satoshi text-foreground/50">
            Your email is used to sign in and can&apos;t be changed here.
          </p>
        ) : null}
      </div>

      <div className="mt-8 border-t border-[#E8E8E8] pt-8">
        <h2 className="text-base font-bold font-montserrat text-foreground">
          {t("account.profile.passwordSecurity")}
        </h2>

        <div className="mt-5">
          <AccountField label={t("account.profile.password")}>
            <div className="flex items-center gap-6">
              <div className="relative min-w-0 flex-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#676565]">
                  <Lock className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <input
                  type="password"
                  defaultValue="password"
                  readOnly
                  className={`${accountInputClassName} pl-10`}
                />
              </div>
              <button
                type="button"
                className="shrink-0 text-sm font-medium font-satoshi text-foreground underline underline-offset-2"
              >
                {t("account.profile.changePassword")}
              </button>
            </div>
          </AccountField>
        </div>
      </div>
    </section>
  );
}
