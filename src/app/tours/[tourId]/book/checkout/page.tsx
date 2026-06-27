import { Suspense } from "react";
import { notFound } from "next/navigation";

import { TourBookingPage } from "@/features/travel/components/tour-booking/tour-booking-page";
import { getTourById } from "@/features/travel/data/tour-booking";

type TourBookingCheckoutRouteProps = {
  params: Promise<{ tourId: string }>;
};

export default async function TourBookingCheckoutRoute({
  params,
}: TourBookingCheckoutRouteProps) {
  const { tourId } = await params;
  const tour = getTourById(tourId);

  if (!tour) {
    notFound();
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F5F5]" />}>
      <TourBookingPage tour={tour} currentStep="checkout" />
    </Suspense>
  );
}
