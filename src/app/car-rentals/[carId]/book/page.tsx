import { notFound } from "next/navigation";

import { CarBookingPage } from "@/features/travel/components/car-booking/car-booking-page";
import { getCar, toCarDetail } from "@/lib/api/cars";
import type { CarDetail } from "@/features/travel/data/car-booking";

type CarBookingRouteProps = {
  params: Promise<{ carId: string }>;
};

export default async function CarBookingRoute({ params }: CarBookingRouteProps) {
  const { carId } = await params;

  let car: CarDetail;
  try {
    car = toCarDetail(await getCar(carId));
  } catch {
    notFound();
  }

  return <CarBookingPage car={car} currentStep="choose-car" />;
}
