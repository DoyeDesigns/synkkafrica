import { Suspense } from "react";
import { notFound } from "next/navigation";

import type { CarBookingStepId } from "@/features/travel/booking/car-constants";
import { CarBookingPage } from "@/features/travel/components/car-booking/car-booking-page";
import { getCarById } from "@/features/travel/data/car-booking";

const VALID_STEPS: CarBookingStepId[] = ["checkout", "payment", "confirmation"];

type CarBookingStepRouteProps = {
  params: Promise<{ carId: string; step: string }>;
};

export default async function CarBookingStepRoute({
  params,
}: CarBookingStepRouteProps) {
  const { carId, step } = await params;

  if (!VALID_STEPS.includes(step as CarBookingStepId)) {
    notFound();
  }

  const car = getCarById(carId);

  if (!car) {
    notFound();
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F5F5]" />}>
      <CarBookingPage car={car} currentStep={step as CarBookingStepId} />
    </Suspense>
  );
}
