import { notFound } from "next/navigation";

import { TourBookingPage } from "@/features/travel/components/tour-booking/tour-booking-page";
import { getTourById } from "@/features/travel/data/tour-booking";

type TourBookingRouteProps = {
  params: Promise<{ tourId: string }>;
};

export default async function TourBookingRoute({ params }: TourBookingRouteProps) {
  const { tourId } = await params;
  const tour = getTourById(tourId);

  if (!tour) {
    notFound();
  }

  return <TourBookingPage tour={tour} currentStep="choose-experience" />;
}
