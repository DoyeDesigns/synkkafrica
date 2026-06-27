"use client";

import {
  CalendarDays,
  Lock,
  Mail,
  MapPin,
  Mars,
  Pencil,
  Phone,
  User,
} from "lucide-react";
import type { Session } from "next-auth";

import {
  AccountField,
  accountInputClassName,
} from "@/features/account/components/account-field";
import { useTranslation } from "@/hooks/use-translation";

type AccountProfileCardProps = {
  session: Session;
};

export function AccountProfileCard({ session }: AccountProfileCardProps) {
  const t = useTranslation();
  const displayName = session.user?.name ?? "";
  const email = session.user?.email ?? "victor@synkkaffric.com";

  return (
    <section className="rounded-2xl border border-[#EEEEEE] bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#BDBDBD]">
          {session.user?.image ? (
            <img
              src={session.user.image}
              alt=""
              className="h-full w-full rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <User className="h-12 w-12 text-white" strokeWidth={1.5} />
          )}
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-sm font-medium font-satoshi text-[#004785] transition-opacity hover:opacity-80"
        >
          <Pencil className="h-4 w-4" strokeWidth={1.75} />
          {t("account.profile.edit")}
        </button>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <AccountField
          label={t("account.profile.fullName")}
          icon={<User className="h-4 w-4" strokeWidth={1.75} />}
        >
          <input
            type="text"
            defaultValue={displayName}
            placeholder={t("account.profile.fullNamePlaceholder")}
            className={`${accountInputClassName} pl-10`}
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

        <AccountField
          label={t("account.profile.dateOfBirth")}
          icon={<CalendarDays className="h-4 w-4" strokeWidth={1.75} />}
        >
          <input
            type="text"
            placeholder={t("account.profile.dobPlaceholder")}
            className={`${accountInputClassName} pl-10`}
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
              type="text"
              defaultValue="080 5*** **80"
              className={`${accountInputClassName} pl-10`}
            />
          </AccountField>

          <AccountField
            label={t("account.profile.email")}
            icon={<Mail className="h-4 w-4" strokeWidth={1.75} />}
          >
            <input
              type="email"
              defaultValue={email}
              className={`${accountInputClassName} pl-10`}
            />
          </AccountField>
        </div>
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
