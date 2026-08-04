"use client";

import { Building2, ChevronDown, Lock, Mail, Phone, Save } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { VendorBusinessDocumentsSection } from "@/features/vendor/components/vendor-business-documents-section";
import {
  VENDOR_PAYOUT_BANK_OPTIONS,
  type VendorBusinessProfile,
} from "@/features/vendor/data/vendor-business-profile";
import { useTranslation } from "@/hooks/use-translation";
import {
  changeVendorPassword,
  getVendorFullProfile,
  updateVendorProfile,
  type UpdateVendorProfileInput,
  type VendorFullProfile,
} from "@/lib/api/vendor";

const inputClassName =
  "h-11 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm font-medium font-satoshi text-foreground outline-none focus:border-[#004785]";

type VendorBusinessProfileContentProps = {
  vendorName?: string | null;
  vendorEmail?: string | null;
};

function formFromProfile(p: VendorFullProfile): VendorBusinessProfile {
  return {
    internalBusinessName: p.businessName ?? "",
    contactPhone: p.phoneNumber ?? "",
    contactEmail: p.email ?? "",
    businessAddress: p.businessAddress ?? "",
    payoutBankId:
      (p.payoutBankId as VendorBusinessProfile["payoutBankId"]) ?? "gtbank",
    payoutAccountNumber: p.payoutAccountNumber ?? "",
    payoutAccountName: p.payoutAccountName ?? "",
    // Backend does not yet return this; default far enough back that cooldown
    // does not block edits until the field is wired from the API.
    payoutAccountLastUpdatedAt: new Date(
      Date.now() - 200 * 24 * 60 * 60 * 1000,
    ).toISOString(),
  };
}

export function VendorBusinessProfileContent({
  vendorName,
  vendorEmail,
}: VendorBusinessProfileContentProps) {
  const t = useTranslation();
  const { data: session } = useSession();
  const token = session?.accessToken;
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ["vendor-profile"],
    queryFn: () => getVendorFullProfile(token as string),
    enabled: Boolean(token),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const displayName =
    profile?.businessName?.trim() || vendorName?.trim() || "your business";

  const [form, setForm] = useState<VendorBusinessProfile | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savedSection, setSavedSection] = useState<string | null>(null);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [errorSection, setErrorSection] = useState<{
    section: string;
    message: string;
  } | null>(null);

  // Seed the editable form from freshly-loaded profile data — the React-endorsed
  // "adjust state during render when a prop changes" pattern (no effect). After
  // a save we set `form` directly, and the query data changes too, so the guard
  // keeps them in sync without clobbering in-progress edits.
  const [seededProfile, setSeededProfile] = useState<VendorFullProfile | null>(
    null,
  );
  if (profile && profile !== seededProfile) {
    setSeededProfile(profile);
    setForm(formFromProfile(profile));
  }

  const updateForm = (patch: Partial<VendorBusinessProfile>) => {
    setForm((current) => (current ? { ...current, ...patch } : current));
  };

  const flashSaved = (section: string) => {
    setSavedSection(section);
    window.setTimeout(() => setSavedSection(null), 2500);
  };

  async function saveSection(section: string, patch: UpdateVendorProfileInput) {
    if (!token) return;
    setSavingSection(section);
    setErrorSection(null);
    try {
      const updated = await updateVendorProfile(token, patch);
      queryClient.setQueryData(["vendor-profile"], updated);
      setForm(formFromProfile(updated));
      flashSaved(section);
    } catch {
      setErrorSection({ section, message: "Couldn't save. Try again." });
    } finally {
      setSavingSection(null);
    }
  }

  async function handleUpdatePassword() {
    if (
      !token ||
      !passwordForm.currentPassword ||
      passwordForm.newPassword.length < 8 ||
      passwordForm.newPassword !== passwordForm.confirmPassword
    ) {
      return;
    }
    setSavingSection("password");
    setErrorSection(null);
    try {
      await changeVendorPassword(
        token,
        passwordForm.currentPassword,
        passwordForm.newPassword,
      );
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      flashSaved("password");
    } catch {
      setErrorSection({
        section: "password",
        message: "Current password is incorrect.",
      });
    } finally {
      setSavingSection(null);
    }
  }

  const email = form?.contactEmail ?? vendorEmail ?? "";

  const renderSaveRow = (section: string) => {
    const err = errorSection?.section === section ? errorSection.message : null;
    return (
      <div className="mt-4 flex items-center justify-end gap-3">
        {err ? (
          <span className="text-xs font-semibold font-satoshi text-[#C0392B]">
            {err}
          </span>
        ) : savedSection === section ? (
          <span className="text-xs font-semibold font-satoshi text-[#2E7D32]">
            {t("vendor.businessProfile.saved")}
          </span>
        ) : null}
        <button
          type="button"
          disabled={savingSection === section || !form}
          onClick={() => {
            if (!form) return;
            if (section === "business") {
              void saveSection("business", {
                businessName: form.internalBusinessName,
              });
            } else if (section === "contact") {
              void saveSection("contact", {
                phoneNumber: form.contactPhone,
                businessAddress: form.businessAddress,
              });
            } else if (section === "payout") {
              void saveSection("payout", {
                payoutBankId: form.payoutBankId,
                payoutAccountNumber: form.payoutAccountNumber,
                payoutAccountName: form.payoutAccountName,
              });
            }
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-[#D85A30] px-4 py-2.5 text-sm font-bold font-satoshi text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          <Save className="h-4 w-4" strokeWidth={2} />
          {savingSection === section
            ? t("common.loading")
            : t("vendor.businessProfile.saveChanges")}
        </button>
      </div>
    );
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
              value={form?.internalBusinessName ?? ""}
              onChange={(event) =>
                updateForm({ internalBusinessName: event.target.value })
              }
              className={inputClassName}
            />
          </label>

          {renderSaveRow("business")}
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
                  value={form?.contactPhone ?? ""}
                  onChange={(event) =>
                    updateForm({ contactPhone: event.target.value })
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
                  value={email}
                  readOnly
                  title="Email is your sign-in identity and can't be changed here."
                  className={`${inputClassName} cursor-default bg-[#FAFAFA] pl-10 text-foreground/80`}
                />
              </div>
            </label>

            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
                {t("vendor.businessProfile.address")}
              </span>
              <input
                type="text"
                value={form?.businessAddress ?? ""}
                onChange={(event) =>
                  updateForm({ businessAddress: event.target.value })
                }
                className={inputClassName}
              />
            </label>
          </div>

          {renderSaveRow("contact")}
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
                  value={form?.payoutBankId ?? "gtbank"}
                  onChange={(event) =>
                    updateForm({
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
                value={form?.payoutAccountNumber ?? ""}
                onChange={(event) =>
                  updateForm({ payoutAccountNumber: event.target.value })
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
                value={form?.payoutAccountName ?? ""}
                onChange={(event) =>
                  updateForm({ payoutAccountName: event.target.value })
                }
                className={inputClassName}
              />
            </label>
          </div>

          {renderSaveRow("payout")}
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
            {errorSection?.section === "password" ? (
              <span className="text-xs font-semibold font-satoshi text-[#C0392B]">
                {errorSection.message}
              </span>
            ) : savedSection === "password" ? (
              <span className="text-xs font-semibold font-satoshi text-[#2E7D32]">
                {t("vendor.businessProfile.passwordUpdated")}
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => void handleUpdatePassword()}
              disabled={
                savingSection === "password" ||
                !passwordForm.currentPassword ||
                passwordForm.newPassword.length < 8 ||
                passwordForm.newPassword !== passwordForm.confirmPassword
              }
              className="inline-flex items-center gap-2 rounded-lg bg-[#004785] px-4 py-2.5 text-sm font-bold font-satoshi text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingSection === "password"
                ? t("common.loading")
                : t("vendor.businessProfile.updatePassword")}
            </button>
          </div>
        </section>

        <VendorBusinessDocumentsSection />
      </div>
    </>
  );
}
