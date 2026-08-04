import { notFound } from "next/navigation";

import { TourBookingPage } from "@/features/travel/components/tour-booking/tour-booking-page";
import { getExperience, toTourDetail } from "@/lib/api/experiences";
import type { TourDetail } from "@/features/travel/data/tour-booking";

type TourBookingRouteProps = {
  params: Promise<{ tourId: string }>;
};

export default async function TourBookingRoute({ params }: TourBookingRouteProps) {
  const { tourId } = await params;

  let tour: TourDetail;
  try {
    tour = toTourDetail(await getExperience(tourId));
  } catch {
    notFound();
  }

  return <TourBookingPage tour={tour} currentStep="choose-experience" />;
}
