import { notFound } from "next/navigation";

import { readDateParam } from "@/features/travel/booking/booking-params";
import { TourBookingPage } from "@/features/travel/components/tour-booking/tour-booking-page";
import { getExperience, toTourDetail } from "@/lib/api/experiences";
import type { TourDetail } from "@/features/travel/data/tour-booking";

type TourBookingRouteProps = {
  params: Promise<{ tourId: string }>;
  searchParams: Promise<{ date?: string | string[] }>;
};

export default async function TourBookingRoute({
  params,
  searchParams,
}: TourBookingRouteProps) {
  const { tourId } = await params;
  const query = await searchParams;

  let tour: TourDetail;
  try {
    tour = toTourDetail(await getExperience(tourId));
  } catch {
    notFound();
  }

  return (
    <TourBookingPage
      tour={tour}
      currentStep="choose-experience"
      initialDate={readDateParam(query.date)}
    />
  );
}
