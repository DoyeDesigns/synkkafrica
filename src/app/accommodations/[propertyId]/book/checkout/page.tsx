import { Suspense } from "react";
import { notFound } from "next/navigation";

import { PropertyBookingPage } from "@/features/travel/components/booking/property-booking-page";
import { getPropertyById } from "@/features/travel/data/property-booking";

type PropertyBookingCheckoutRouteProps = {
  params: Promise<{ propertyId: string }>;
};

export default async function PropertyBookingCheckoutRoute({
  params,
}: PropertyBookingCheckoutRouteProps) {
  const { propertyId } = await params;
  const property = getPropertyById(propertyId);

  if (!property) {
    notFound();
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F5F5]" />}>
      <PropertyBookingPage property={property} currentStep="checkout" />
    </Suspense>
  );
}
