"use client";

import { ChevronRight, Lock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { VendorSignupBusinessStep } from "@/features/vendor/components/vendor-signup-business-step";
import { VendorSignupIdentityStep } from "@/features/vendor/components/vendor-signup-identity-step";
import { VendorSignupSecurityStep } from "@/features/vendor/components/vendor-signup-security-step";
import { VendorSignupStepper } from "@/features/vendor/components/vendor-signup-stepper";
import {
  EMPTY_VENDOR_SIGNUP_FORM,
  getNextVendorSignupStep,
  getPreviousVendorSignupStep,
  getVendorSignupBusinessMissingFields,
  isVendorSignupStepValid,
  type VendorSignupFormState,
  type VendorSignupStepId,
} from "@/features/vendor/data/vendor-signup";
import { useTranslation } from "@/hooks/use-translation";

export function VendorSignupContent() {
  const t = useTranslation();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<VendorSignupStepId>("business");
  const [form, setForm] = useState<VendorSignupFormState>(EMPTY_VENDOR_SIGNUP_FORM);

  const updateForm = (patch: Partial<VendorSignupFormState>) => {
    setForm((current) => ({ ...current, ...patch }));
  };

  const handleContinue = () => {
    const nextStep = getNextVendorSignupStep(currentStep);

    if (!nextStep || !isVendorSignupStepValid(currentStep, form)) {
      return;
    }

    setCurrentStep(nextStep);
  };

  const handleBack = () => {
    const previousStep = getPreviousVendorSignupStep(currentStep);

    if (previousStep) {
      setCurrentStep(previousStep);
      return;
    }

    router.push("/vendor/login");
  };

  const handleSubmit = () => {
    if (!isVendorSignupStepValid("identity", form)) {
      return;
    }

    router.push("/vendor");
  };

  const isLastStep = currentStep === "identity";
  const canContinue = isVendorSignupStepValid(currentStep, form);
  const missingBusinessFields =
    currentStep === "business" ? getVendorSignupBusinessMissingFields(form) : [];

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-[#E5E5E5] px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-4">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <Image
              src="/synkkafrica-logo.svg"
              alt="SynkkAfrica"
              width={40}
              height={40}
              priority
            />
            <span className="text-lg font-bold font-montserrat text-[#2F2F2F]">SynkkAfrica</span>
          </Link>
          <VendorSignupStepper currentStep={currentStep} />
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-satoshi text-[#2F2F2F]">
            {t("vendor.signup.title")}
          </h1>
          <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
            {t("vendor.signup.subtitle")}
          </p>
          <p className="mt-2 text-sm font-medium font-satoshi text-[#676565]">
            {t("vendor.signup.alreadyHaveAccount")}{" "}
            <Link href="/vendor/login" className="font-bold text-[#D85A30] hover:underline">
              {t("vendor.signup.signIn")}
            </Link>
          </p>
        </div>

        <div className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm sm:p-6">
          {currentStep === "business" ? (
            <VendorSignupBusinessStep form={form} onChange={updateForm} />
          ) : null}
          {currentStep === "security" ? (
            <VendorSignupSecurityStep form={form} onChange={updateForm} />
          ) : null}
          {currentStep === "identity" ? (
            <VendorSignupIdentityStep form={form} onChange={updateForm} />
          ) : null}
        </div>

        {isLastStep ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-[#BBDEFB] bg-[#EBF5FB] px-4 py-4">
              <div className="flex gap-3">
                <Lock className="mt-0.5 h-5 w-5 shrink-0 text-[#1565C0]" />
                <div>
                  <p className="text-sm font-bold font-satoshi text-[#1565C0]">
                    {t("vendor.signup.securityBanner.title")}
                  </p>
                  <p className="mt-1 text-xs font-medium font-satoshi leading-relaxed text-[#676565]">
                    {t("vendor.signup.securityBanner.message")}
                  </p>
                </div>
              </div>
            </div>

            <label className="flex items-start gap-3 rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] px-4 py-3">
              <input
                type="checkbox"
                checked={form.agreedToTerms}
                onChange={(event) => updateForm({ agreedToTerms: event.target.checked })}
                className="mt-0.5 h-5 w-5 rounded border-[#CFCFCF] text-[#D85A30] focus:ring-[#D85A30]"
              />
              <span className="text-sm font-medium font-satoshi text-[#2F2F2F]">
                {t("vendor.signup.agreeTermsPrefix")}{" "}
                <Link href="/terms" className="font-bold text-[#135391] hover:underline">
                  {t("vendor.signup.termsOfService")}
                </Link>{" "}
                {t("vendor.signup.and")}{" "}
                <Link href="/privacy" className="font-bold text-[#135391] hover:underline">
                  {t("vendor.signup.privacyPolicy")}
                </Link>
              </span>
            </label>
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 border-t border-[#EEEEEE] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-[#E5E5E5] bg-white px-5 text-sm font-bold font-satoshi text-[#2F2F2F] transition-colors hover:bg-[#FAFAFA]"
          >
            {currentStep === "business" ? t("vendor.signup.cancel") : t("vendor.signup.back")}
          </button>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {!canContinue && missingBusinessFields.length > 0 ? (
              <p className="text-xs font-medium font-satoshi text-[#E65100] sm:mr-auto sm:text-right">
                {t("vendor.signup.completeRequiredFields", {
                  fields: missingBusinessFields.map((field) => t(field)).join(", "),
                })}
              </p>
            ) : null}

            {!canContinue && currentStep === "security" ? (
              <p className="text-xs font-medium font-satoshi text-[#E65100] sm:mr-auto sm:text-right">
                {t("vendor.signup.securityRequired")}
              </p>
            ) : null}

            {!canContinue && currentStep === "identity" ? (
              <p className="text-xs font-medium font-satoshi text-[#E65100] sm:mr-auto sm:text-right">
                {t("vendor.signup.identityRequired")}
              </p>
            ) : null}

            {isLastStep ? (
              <button
                type="button"
                disabled={!canContinue}
                onClick={handleSubmit}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#D85A30] px-5 text-sm font-bold font-satoshi text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t("vendor.signup.createAccount")}
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={!canContinue}
                onClick={handleContinue}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#D85A30] px-5 text-sm font-bold font-satoshi text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t("vendor.signup.continue")}
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
