"use client";

import Link from "next/link";

import {
  TOUR_BOOKING_STEPS,
  getTourBookingStepHref,
  type TourBookingStepId,
} from "@/features/travel/booking/tour-constants";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

const STEP_LABEL_KEYS: Record<TourBookingStepId, TranslationKey> = {
  "choose-experience": "booking.step.chooseExperience",
  checkout: "booking.step.checkout",
  payment: "booking.step.payment",
  confirmation: "booking.step.confirmation",
};

type TourBookingStepperProps = {
  tourId: string;
  currentStep: TourBookingStepId;
};

export function TourBookingStepper({
  tourId,
  currentStep,
}: TourBookingStepperProps) {
  const t = useTranslation();
  const currentIndex = TOUR_BOOKING_STEPS.findIndex(
    (step) => step.id === currentStep,
  );

  return (
    <nav aria-label="Booking progress" className="overflow-x-auto">
      <ol className="flex min-w-[680px] items-start">
        {TOUR_BOOKING_STEPS.map((step, index) => {
          const isActive = step.id === currentStep;
          const isComplete = index < currentIndex;
          const Icon = step.icon;

          return (
            <li key={step.id} className="flex items-center">
              <Link
                href={getTourBookingStepHref(tourId, step.id)}
                className="group flex min-w-0 flex-1 items-center gap-2 px-2 text-center"
              >
                <span
                  className={`flex size-6 items-center justify-center rounded-full border transition-colors ${
                    isActive || isComplete
                      ? "border-[#D85A30] bg-[#D85A30] text-white"
                      : "border-[#004785] bg-[#004785] text-white"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                </span>
                <span
                  className={`text-xs font-medium font-satoshi leading-tight sm:text-sm ${
                    isActive || isComplete ? "text-[#D85A30]" : "text-[#676565]"
                  }`}
                >
                  {t(STEP_LABEL_KEYS[step.id])}
                </span>
              </Link>

              {index < TOUR_BOOKING_STEPS.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={`h-px w-8.5 ${
                    index > currentIndex ? "bg-[#004785]" : "bg-[#D85A30]"
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
