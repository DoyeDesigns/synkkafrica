import { Suspense } from "react";
import { notFound } from "next/navigation";

import type { TourPackageBookingStepId } from "@/features/tour-packages/booking/tour-package-constants";
import { TourPackageBookingPage } from "@/features/tour-packages/components/tour-package-booking/tour-package-booking-page";
import { getTourPackageById } from "@/features/tour-packages/data/tour-package-booking";

const VALID_STEPS: TourPackageBookingStepId[] = [
  "checkout",
  "payment",
  "confirmation",
];

type TourPackageBookingStepRouteProps = {
  params: Promise<{ packageId: string; step: string }>;
};

export default async function TourPackageBookingStepRoute({
  params,
}: TourPackageBookingStepRouteProps) {
  const { packageId, step } = await params;

  if (!VALID_STEPS.includes(step as TourPackageBookingStepId)) {
    notFound();
  }

  const tourPackage = getTourPackageById(packageId);

  if (!tourPackage) {
    notFound();
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F5F5]" />}>
      <TourPackageBookingPage
        tourPackage={tourPackage}
        currentStep={step as TourPackageBookingStepId}
      />
    </Suspense>
  );
}
