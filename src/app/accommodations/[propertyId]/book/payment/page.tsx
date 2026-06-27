import { notFound } from "next/navigation";

import { PropertyBookingPage } from "@/features/travel/components/booking/property-booking-page";
import { getPropertyById } from "@/features/travel/data/property-booking";

type PropertyBookingPaymentRouteProps = {
  params: Promise<{ propertyId: string }>;
};

export default async function PropertyBookingPaymentRoute({
  params,
}: PropertyBookingPaymentRouteProps) {
  const { propertyId } = await params;
  const property = getPropertyById(propertyId);

  if (!property) {
    notFound();
  }

  return <PropertyBookingPage property={property} currentStep="payment" />;
}
