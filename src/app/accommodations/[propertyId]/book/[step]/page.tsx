import { notFound } from "next/navigation";

import type { BookingStepId } from "@/features/travel/booking/constants";
import { PropertyBookingPage } from "@/features/travel/components/booking/property-booking-page";
import { getAccommodation, toPropertyDetail } from "@/lib/api/accommodations";
import type { PropertyDetail } from "@/features/travel/data/property-booking";

const VALID_STEPS: BookingStepId[] = ["checkout", "payment", "confirmation"];

type BookingStepRouteProps = {
  params: Promise<{ propertyId: string; step: string }>;
};

export default async function BookingStepRoute({ params }: BookingStepRouteProps) {
  const { propertyId, step } = await params;

  if (!VALID_STEPS.includes(step as BookingStepId)) {
    notFound();
  }

  let property: PropertyDetail;
  try {
    property = toPropertyDetail(await getAccommodation(propertyId));
  } catch {
    notFound();
  }

  return (
    <PropertyBookingPage
      property={property}
      currentStep={step as BookingStepId}
    />
  );
}
