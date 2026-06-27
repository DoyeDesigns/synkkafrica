import { Suspense } from "react";
import { notFound } from "next/navigation";

import { CarBookingPage } from "@/features/travel/components/car-booking/car-booking-page";
import { getCarById } from "@/features/travel/data/car-booking";

type CarBookingCheckoutRouteProps = {
  params: Promise<{ carId: string }>;
};

export default async function CarBookingCheckoutRoute({
  params,
}: CarBookingCheckoutRouteProps) {
  const { carId } = await params;
  const car = getCarById(carId);

  if (!car) {
    notFound();
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F5F5]" />}>
      <CarBookingPage car={car} currentStep="checkout" />
    </Suspense>
  );
}
