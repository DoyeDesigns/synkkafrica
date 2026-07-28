"use client";

import { Building2, ChevronDown, Lock, Mail, Phone, Save } from "lucide-react";
import { useState } from "react";

import { VendorBusinessDocumentsSection } from "@/features/vendor/components/vendor-business-documents-section";
import {
  createDefaultVendorBusinessProfile,
  VENDOR_PAYOUT_BANK_OPTIONS,
  type VendorBusinessProfile,
} from "@/features/vendor/data/vendor-business-profile";
import { useTranslation } from "@/hooks/use-translation";

const inputClassName =
  "h-11 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm font-medium font-satoshi text-foreground outline-none focus:border-[#004785]";

type VendorBusinessProfileContentProps = {
  vendorName?: string | null;
  vendorEmail?: string | null;
};

export function VendorBusinessProfileContent({
  vendorName = "Alex Autos",
  vendorEmail,
}: VendorBusinessProfileContentProps) {
  const t = useTranslation();
  const displayName = vendorName?.trim() || "Alex Autos";

  const [profile, setProfile] = useState<VendorBusinessProfile>(() =>
    createDefaultVendorBusinessProfile({
      internalBusinessName: `${displayName} Experiences Ltd`,
      contactEmail: vendorEmail ?? "alex@alexautos.ng",
      payoutAccountName: `${displayName} Experiences Ltd`,
    }),
  );

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [savedSection, setSavedSection] = useState<string | null>(null);

  const showSavedFeedback = (section: string) => {
    setSavedSection(section);
    window.setTimeout(() => setSavedSection(null), 2500);
  };

  const updateProfile = (patch: Partial<VendorBusinessProfile>) => {
    setProfile((current) => ({ ...current, ...patch }));
  };

  const handleSaveBusinessName = () => {
    showSavedFeedback("business");
  };

  const handleSaveContact = () => {
    showSavedFeedback("contact");
  };

  const handleSavePayout = () => {
    showSavedFeedback("payout");
  };

  const handleUpdatePassword = () => {
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      passwordForm.newPassword !== passwordForm.confirmPassword
    ) {
      return;
    }

    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    showSavedFeedback("password");
  };

  return (
    <>
      <h2 className="text-xl font-medium font-satoshi text-[#2F2F2F]">
        {t("vendor.dashboard.welcomeBack")}{" "}
        <span className="font-bold text-[#D85A30]">{displayName}</span>
      </h2>

      <div className="space-y-6">
        <section className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E3F2FD] text-[#1565C0]">
              <Building2 className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold font-satoshi text-[#2F2F2F]">
                {t("vendor.businessProfile.businessName")}
              </h3>
              <p className="mt-1 text-xs font-medium font-satoshi text-[#676565]">
                {t("vendor.businessProfile.businessNameHint")}
              </p>
            </div>
          </div>

          <label className="mt-5 flex flex-col gap-2">
            <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
              {t("vendor.businessProfile.internalNameLabel")}
            </span>
            <input
              type="text"
              value={profile.internalBusinessName}
              onChange={(event) =>
                updateProfile({ internalBusinessName: event.target.value })
              }
              className={inputClassName}
            />
          </label>

          <div className="mt-4 flex items-center justify-end gap-3">
            {savedSection === "business" ? (
              <span className="text-xs font-semibold font-satoshi text-[#2E7D32]">
                {t("vendor.businessProfile.saved")}
              </span>
            ) : null}
            <button
              type="button"
              onClick={handleSaveBusinessName}
              className="inline-flex items-center gap-2 rounded-lg bg-[#D85A30] px-4 py-2.5 text-sm font-bold font-satoshi text-white transition-opacity hover:opacity-90"
            >
              <Save className="h-4 w-4" strokeWidth={2} />
              {t("vendor.businessProfile.saveChanges")}
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm sm:p-6">
          <h3 className="text-base font-bold font-satoshi text-[#2F2F2F]">
            {t("vendor.businessProfile.contactDetails")}
          </h3>
          <p className="mt-1 text-xs font-medium font-satoshi text-[#676565]">
            {t("vendor.businessProfile.contactDetailsHint")}
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
                {t("vendor.businessProfile.phone")}
              </span>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]" />
                <input
                  type="tel"
                  value={profile.contactPhone}
                  onChange={(event) =>
                    updateProfile({ contactPhone: event.target.value })
                  }
                  className={`${inputClassName} pl-10`}
                />
              </div>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
                {t("vendor.businessProfile.email")}
              </span>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]" />
                <input
                  type="email"
                  value={profile.contactEmail}
                  onChange={(event) =>
                    updateProfile({ contactEmail: event.target.value })
                  }
                  className={`${inputClassName} pl-10`}
                />
              </div>
            </label>

            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
                {t("vendor.businessProfile.address")}
              </span>
              <input
                type="text"
                value={profile.businessAddress}
                onChange={(event) =>
                  updateProfile({ businessAddress: event.target.value })
                }
                className={inputClassName}
              />
            </label>
          </div>

          <div className="mt-4 flex items-center justify-end gap-3">
            {savedSection === "contact" ? (
              <span className="text-xs font-semibold font-satoshi text-[#2E7D32]">
                {t("vendor.businessProfile.saved")}
              </span>
            ) : null}
            <button
              type="button"
              onClick={handleSaveContact}
              className="inline-flex items-center gap-2 rounded-lg bg-[#D85A30] px-4 py-2.5 text-sm font-bold font-satoshi text-white transition-opacity hover:opacity-90"
            >
              <Save className="h-4 w-4" strokeWidth={2} />
              {t("vendor.businessProfile.saveChanges")}
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm sm:p-6">
          <h3 className="text-base font-bold font-satoshi text-[#2F2F2F]">
            {t("vendor.businessProfile.payoutAccount")}
          </h3>
          <p className="mt-1 text-xs font-medium font-satoshi text-[#676565]">
            {t("vendor.businessProfile.payoutAccountHint")}
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
                {t("vendor.businessProfile.bankName")}
              </span>
              <div className="relative">
                <select
                  value={profile.payoutBankId}
                  onChange={(event) =>
                    updateProfile({
                      payoutBankId: event.target
                        .value as VendorBusinessProfile["payoutBankId"],
                    })
                  }
                  className={`${inputClassName} appearance-none pr-10`}
                >
                  {VENDOR_PAYOUT_BANK_OPTIONS.map((bank) => (
                    <option key={bank.id} value={bank.id}>
                      {t(bank.labelKey)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]" />
              </div>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
                {t("vendor.businessProfile.accountNumber")}
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={profile.payoutAccountNumber}
                onChange={(event) =>
                  updateProfile({ payoutAccountNumber: event.target.value })
                }
                className={inputClassName}
              />
            </label>

            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
                {t("vendor.businessProfile.accountName")}
              </span>
              <input
                type="text"
                value={profile.payoutAccountName}
                onChange={(event) =>
                  updateProfile({ payoutAccountName: event.target.value })
                }
                className={inputClassName}
              />
            </label>
          </div>

          <div className="mt-4 flex items-center justify-end gap-3">
            {savedSection === "payout" ? (
              <span className="text-xs font-semibold font-satoshi text-[#2E7D32]">
                {t("vendor.businessProfile.saved")}
              </span>
            ) : null}
            <button
              type="button"
              onClick={handleSavePayout}
              className="inline-flex items-center gap-2 rounded-lg bg-[#D85A30] px-4 py-2.5 text-sm font-bold font-satoshi text-white transition-opacity hover:opacity-90"
            >
              <Save className="h-4 w-4" strokeWidth={2} />
              {t("vendor.businessProfile.saveChanges")}
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm sm:p-6">
          <h3 className="text-base font-bold font-satoshi text-[#2F2F2F]">
            {t("vendor.businessProfile.passwordUpdate")}
          </h3>
          <p className="mt-1 text-xs font-medium font-satoshi text-[#676565]">
            {t("vendor.businessProfile.passwordUpdateHint")}
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
                {t("vendor.businessProfile.currentPassword")}
              </span>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]" />
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({
                      ...current,
                      currentPassword: event.target.value,
                    }))
                  }
                  className={`${inputClassName} pl-10`}
                />
              </div>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
                {t("vendor.businessProfile.newPassword")}
              </span>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]" />
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({
                      ...current,
                      newPassword: event.target.value,
                    }))
                  }
                  className={`${inputClassName} pl-10`}
                />
              </div>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
                {t("vendor.businessProfile.confirmPassword")}
              </span>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]" />
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({
                      ...current,
                      confirmPassword: event.target.value,
                    }))
                  }
                  className={`${inputClassName} pl-10`}
                />
              </div>
            </label>
          </div>

          {passwordForm.newPassword &&
          passwordForm.confirmPassword &&
          passwordForm.newPassword !== passwordForm.confirmPassword ? (
            <p className="mt-3 text-xs font-medium font-satoshi text-[#C0392B]">
              {t("vendor.businessProfile.passwordMismatch")}
            </p>
          ) : null}

          <div className="mt-4 flex items-center justify-end gap-3">
            {savedSection === "password" ? (
              <span className="text-xs font-semibold font-satoshi text-[#2E7D32]">
                {t("vendor.businessProfile.passwordUpdated")}
              </span>
            ) : null}
            <button
              type="button"
              onClick={handleUpdatePassword}
              disabled={
                !passwordForm.currentPassword ||
                !passwordForm.newPassword ||
                passwordForm.newPassword !== passwordForm.confirmPassword
              }
              className="inline-flex items-center gap-2 rounded-lg bg-[#004785] px-4 py-2.5 text-sm font-bold font-satoshi text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("vendor.businessProfile.updatePassword")}
            </button>
          </div>
        </section>

        <VendorBusinessDocumentsSection />
      </div>
    </>
  );
}
