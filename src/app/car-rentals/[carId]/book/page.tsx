import { notFound } from "next/navigation";

import { CarBookingPage } from "@/features/travel/components/car-booking/car-booking-page";
import { getCarById } from "@/features/travel/data/car-booking";

type CarBookingRouteProps = {
  params: Promise<{ carId: string }>;
};

export default async function CarBookingRoute({ params }: CarBookingRouteProps) {
  const { carId } = await params;
  const car = getCarById(carId);

  if (!car) {
    notFound();
  }

  return <CarBookingPage car={car} currentStep="choose-car" />;
}
