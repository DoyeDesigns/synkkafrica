"use client";

import { Building2, ShieldCheck, UserRound } from "lucide-react";

import {
  VENDOR_SIGNUP_STEPS,
  VENDOR_SIGNUP_STEP_LABEL_KEYS,
  type VendorSignupStepId,
} from "@/features/vendor/data/vendor-signup";
import { useTranslation } from "@/hooks/use-translation";

const STEP_ICONS = {
  business: Building2,
  security: ShieldCheck,
  identity: UserRound,
} as const;

type VendorSignupStepperProps = {
  currentStep: VendorSignupStepId;
};

export function VendorSignupStepper({ currentStep }: VendorSignupStepperProps) {
  const t = useTranslation();
  const currentIndex = VENDOR_SIGNUP_STEPS.indexOf(currentStep);

  return (
    <nav aria-label={t("vendor.signup.progressLabel")} className="overflow-x-auto">
      <ol className="flex min-w-[640px] items-start justify-center">
        {VENDOR_SIGNUP_STEPS.map((step, index) => {
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
                  {index + 1}. {t(VENDOR_SIGNUP_STEP_LABEL_KEYS[step])}
                </span>
              </div>

              {index < VENDOR_SIGNUP_STEPS.length - 1 ? (
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
