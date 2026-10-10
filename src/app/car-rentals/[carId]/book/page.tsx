import { notFound } from "next/navigation";

import {
  readCountParam,
  readDateParam,
  readTimeParam,
} from "@/features/travel/booking/booking-params";
import { CarBookingPage } from "@/features/travel/components/car-booking/car-booking-page";
import { getCar, toCarDetail } from "@/lib/api/cars";
import type { CarDetail } from "@/features/travel/data/car-booking";

type CarBookingRouteProps = {
  params: Promise<{ carId: string }>;
  searchParams: Promise<{
    date?: string | string[];
    time?: string | string[];
    location?: string | string[];
    airport?: string | string[];
    passengers?: string | string[];
  }>;
};

function firstQueryValue(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.trim() ?? "";
}

export default async function CarBookingRoute({
  params,
  searchParams,
}: CarBookingRouteProps) {
  const { carId } = await params;
  const query = await searchParams;
  const pickupAddress =
    firstQueryValue(query.location) || firstQueryValue(query.airport);

  let car: CarDetail;
  try {
    car = toCarDetail(await getCar(carId));
  } catch {
    notFound();
  }

  return (
    <CarBookingPage
      car={car}
      currentStep="choose-car"
      initialPickupDate={readDateParam(query.date)}
      initialTime={readTimeParam(query.time)}
      initialPickupAddress={pickupAddress}
      initialPassengers={readCountParam(query.passengers, 1, 1, 12)}
    />
  );
}
