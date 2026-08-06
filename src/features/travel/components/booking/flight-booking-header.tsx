"use client";

import Link from "next/link";
import { Check, CreditCard, User, type LucideIcon } from "lucide-react";

import { useTranslation } from "@/hooks/use-translation";

export type FlightBookingStepId = "details" | "payment" | "confirmation";

const STEPS: { id: FlightBookingStepId; label: string; icon: LucideIcon }[] = [
  { id: "details", label: "Passenger Details", icon: User },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "confirmation", label: "Confirmation", icon: Check },
];

function FlightBreadcrumbs({ trip }: { trip: string }) {
  const t = useTranslation();
  return (
    <nav aria-label="Breadcrumb" className="text-sm font-satoshi">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link
            href="/"
            className="font-medium text-[#D85A30] transition-opacity hover:opacity-80"
          >
            {t("breadcrumb.synkAfrica")}
          </Link>
        </li>
        <li aria-hidden="true" className="text-foreground/50">
          |
        </li>
        <li>
          <Link
            href="/?section=flights&view=results"
            className="font-medium text-[#D85A30] transition-opacity hover:opacity-80"
          >
            {t("breadcrumb.flights")}
          </Link>
        </li>
        <li aria-hidden="true" className="text-foreground/50">
          |
        </li>
        <li>
          <span className="font-medium text-foreground">{trip}</span>
        </li>
      </ol>
    </nav>
  );
}

function FlightStepper({ currentStep }: { currentStep: FlightBookingStepId }) {
  const currentIndex = STEPS.findIndex((step) => step.id === currentStep);

  return (
    <nav aria-label="Booking progress" className="overflow-x-auto">
      <ol className="flex min-w-[440px] items-start">
        {STEPS.map((step, index) => {
          const isActive = step.id === currentStep;
          const isComplete = index < currentIndex;
          const done = isActive || isComplete;
          const Icon = step.icon;

          return (
            <li key={step.id} className="flex items-center">
              <div className="group flex min-w-0 flex-1 items-center gap-2 px-2 text-center">
                <span
                  className={`flex size-6 items-center justify-center rounded-full border transition-colors ${
                    done
                      ? "border-[#D85A30] bg-[#D85A30] text-white"
                      : "border-[#004785] bg-[#004785] text-white"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                </span>
                <span
                  className={`text-xs font-medium font-satoshi leading-tight sm:text-sm ${
                    done ? "text-[#D85A30]" : "text-[#676565]"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {index < STEPS.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={`h-px w-8.5 ${
                    index >= currentIndex ? "bg-[#004785]" : "bg-[#D85A30]"
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

export function FlightBookingHeader({
  trip,
  currentStep,
}: {
  trip: string;
  currentStep: FlightBookingStepId;
}) {
  return (
    <div className="flex w-full flex-col justify-between gap-3 border-b border-[#CCCCCC] pb-5.5 md:flex-row md:items-center">
      <FlightBreadcrumbs trip={trip} />
      <FlightStepper currentStep={currentStep} />
    </div>
  );
}
