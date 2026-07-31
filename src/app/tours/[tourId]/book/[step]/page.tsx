import { notFound } from "next/navigation";

import type { TourBookingStepId } from "@/features/travel/booking/tour-constants";
import { TourBookingPage } from "@/features/travel/components/tour-booking/tour-booking-page";
import { getExperience, toTourDetail } from "@/lib/api/experiences";
import type { TourDetail } from "@/features/travel/data/tour-booking";

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

  let tour: TourDetail;
  try {
    tour = toTourDetail(await getExperience(tourId));
  } catch {
    notFound();
  }

  return (
    <TourBookingPage tour={tour} currentStep={step as TourBookingStepId} />
  );
}
