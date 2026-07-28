"use client";

import { CheckCircle2, CircleDollarSign, Layers3, PencilLine } from "lucide-react";

import {
  PACKAGE_STEPS,
  STEP_LABEL_KEYS,
  type PackageStepId,
} from "@/features/admin/data/admin-add-package";
import { useTranslation } from "@/hooks/use-translation";

const STEP_ICONS = {
  details: PencilLine,
  modules: Layers3,
  pricing: CircleDollarSign,
  review: CheckCircle2,
} as const;

type AdminAddPackageStepperProps = {
  currentStep: PackageStepId;
};

export function AdminAddPackageStepper({ currentStep }: AdminAddPackageStepperProps) {
  const t = useTranslation();
  const currentIndex = PACKAGE_STEPS.indexOf(currentStep);

  return (
    <nav aria-label={t("admin.packages.progressLabel")} className="overflow-x-auto">
      <ol className="flex min-w-[760px] items-start justify-center">
        {PACKAGE_STEPS.map((step, index) => {
          const isActive = step === currentStep;
          const isComplete = index < currentIndex;
          const Icon = STEP_ICONS[step];

          return (
            <li key={step} className="flex items-center">
              <div className="flex min-w-0 flex-1 items-center gap-2 px-2">
                <span
                  className={`flex size-7 shrink-0 items-center justify-center rounded-full border transition-colors ${
                    isActive || isComplete
                      ? "border-[#D85A30] bg-[#D85A30] text-white"
                      : "border-[#676565] bg-[#676565] text-white"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                </span>
                <span
                  className={`text-xs font-medium font-satoshi leading-tight sm:text-sm ${
                    isActive || isComplete ? "text-[#D85A30]" : "text-[#676565]"
                  }`}
                >
                  {index + 1}. {t(STEP_LABEL_KEYS[step])}
                </span>
              </div>

              {index < PACKAGE_STEPS.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={`h-px w-8 shrink-0 ${
                    index < currentIndex ? "bg-[#D85A30]" : "bg-[#676565]"
                  }`}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
