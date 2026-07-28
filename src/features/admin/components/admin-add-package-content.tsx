"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { PackageDetailsStep } from "@/features/admin/components/admin-add-package-details-step";
import { PackageModulesStep } from "@/features/admin/components/admin-add-package-modules-step";
import { PackagePricingStep } from "@/features/admin/components/admin-add-package-pricing-step";
import { PackageReviewStep } from "@/features/admin/components/admin-add-package-review-step";
import { AdminAddPackageStepper } from "@/features/admin/components/admin-add-package-stepper";
import {
  EMPTY_ADD_PACKAGE_FORM,
  getNextPackageStep,
  getPackageDetailsMissingFields,
  getPreviousPackageStep,
  isPackageStepValid,
  type AddPackageFormState,
  type PackageStepId,
} from "@/features/admin/data/admin-add-package";
import { useTranslation } from "@/hooks/use-translation";

export function AdminAddPackageContent() {
  const t = useTranslation();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<PackageStepId>("details");
  const [form, setForm] = useState<AddPackageFormState>(EMPTY_ADD_PACKAGE_FORM);
  const [draftSaved, setDraftSaved] = useState(false);

  const updateForm = (patch: Partial<AddPackageFormState>) => {
    setForm((current) => ({ ...current, ...patch }));
  };

  const handleContinue = () => {
    const nextStep = getNextPackageStep(currentStep);

    if (!nextStep || !isPackageStepValid(currentStep, form)) {
      return;
    }

    setCurrentStep(nextStep);
  };

  const handleBack = () => {
    const previousStep = getPreviousPackageStep(currentStep);

    if (previousStep) {
      setCurrentStep(previousStep);
      return;
    }

    router.push("/admin");
  };

  const handleSaveDraft = () => {
    setDraftSaved(true);
    window.setTimeout(() => setDraftSaved(false), 2500);
  };

  const handleSubmit = () => {
    router.push("/admin");
  };

  const isLastStep = currentStep === "review";
  const canContinue = isPackageStepValid(currentStep, form);
  const missingDetailFields =
    currentStep === "details" ? getPackageDetailsMissingFields(form) : [];

  return (
    <>
      <div className="-mx-4 -mt-4 border-b border-[#E5E5E5] bg-white px-4 py-4 sm:-mx-6 sm:-mt-6 sm:px-6 lg:-mx-8 lg:-mt-8 lg:px-8">
        <AdminAddPackageStepper currentStep={currentStep} />
      </div>

      <div className="space-y-6">
        <Link
          href="/admin"
          className="inline-flex text-sm font-medium font-satoshi text-[#135391] hover:underline"
        >
          {t("admin.packages.backToDashboard")}
        </Link>

        <div>
          <h2 className="text-2xl font-bold font-satoshi text-[#2F2F2F]">
            {t("admin.packages.createTitle")}
          </h2>
          <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
            {t("admin.packages.createSubtitle")}
          </p>
        </div>

        <div className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm sm:p-6">
          {currentStep === "details" ? (
            <PackageDetailsStep form={form} onChange={updateForm} />
          ) : null}
          {currentStep === "modules" ? (
            <PackageModulesStep form={form} onChange={updateForm} />
          ) : null}
          {currentStep === "pricing" ? (
            <PackagePricingStep form={form} onChange={updateForm} />
          ) : null}
          {currentStep === "review" ? <PackageReviewStep form={form} /> : null}
        </div>

        <div className="flex flex-col gap-3 border-t border-[#EEEEEE] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-[#E5E5E5] bg-white px-5 text-sm font-bold font-satoshi text-[#2F2F2F] transition-colors hover:bg-[#FAFAFA]"
          >
            {currentStep === "details"
              ? t("admin.packages.cancel")
              : t("admin.packages.back")}
          </button>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {!canContinue && missingDetailFields.length > 0 ? (
              <p className="text-xs font-medium font-satoshi text-[#E65100] sm:mr-auto sm:text-right">
                {t("admin.packages.completeRequiredFields", {
                  fields: missingDetailFields.map((field) => t(field)).join(", "),
                })}
              </p>
            ) : null}

            {!canContinue && currentStep === "modules" ? (
              <p className="text-xs font-medium font-satoshi text-[#E65100] sm:mr-auto sm:text-right">
                {t("admin.packages.modules.required")}
              </p>
            ) : null}

            {draftSaved ? (
              <span className="text-sm font-semibold font-satoshi text-[#2E7D32]">
                {t("admin.packages.draftSaved")}
              </span>
            ) : (
              <button
                type="button"
                onClick={handleSaveDraft}
                className="text-sm font-bold font-satoshi text-[#135391] hover:underline"
              >
                {t("admin.packages.saveDraft")}
              </button>
            )}

            {isLastStep ? (
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#D85A30] px-5 text-sm font-bold font-satoshi text-white transition-opacity hover:opacity-90"
              >
                {t("admin.packages.submit")}
              </button>
            ) : (
              <button
                type="button"
                disabled={!canContinue}
                onClick={handleContinue}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#D85A30] px-5 text-sm font-bold font-satoshi text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t("admin.packages.saveContinue")}
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
