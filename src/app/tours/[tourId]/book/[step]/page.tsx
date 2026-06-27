import { Suspense } from "react";
import { notFound } from "next/navigation";

import type { TourBookingStepId } from "@/features/travel/booking/tour-constants";
import { TourBookingPage } from "@/features/travel/components/tour-booking/tour-booking-page";
import { getTourById } from "@/features/travel/data/tour-booking";

const VALID_STEPS: TourBookingStepId[] = ["checkout", "payment", "confirmation"];

type TourBookingStepRouteProps = {
  params: Promise<{ tourId: string; step: string }>;
};

export default async function TourBookingStepRoute({
  params,
}: TourBookingStepRouteProps) {
  const { tourId, step } = await params;

  if (!VALID_STEPS.includes(step as TourBookingStepId)) {
    notFound();
  }

  const tour = getTourById(tourId);

  if (!tour) {
    notFound();
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F5F5]" />}>
      <TourBookingPage tour={tour} currentStep={step as TourBookingStepId} />
    </Suspense>
  );
}
