import { notFound } from "next/navigation";

import { PropertyBookingPage } from "@/features/travel/components/booking/property-booking-page";
import { getAccommodation, toPropertyDetail } from "@/lib/api/accommodations";
import type { PropertyDetail } from "@/features/travel/data/property-booking";

type PropertyBookingRouteProps = {
  params: Promise<{ propertyId: string }>;
};

export default async function PropertyBookingRoute({
  params,
}: PropertyBookingRouteProps) {
  const { propertyId } = await params;

  let property: PropertyDetail;
  try {
    property = toPropertyDetail(await getAccommodation(propertyId));
  } catch {
    notFound();
  }

  return <PropertyBookingPage property={property} currentStep="rooms" />;
}
