"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import type { CarBookingStepId } from "@/features/travel/booking/car-constants";
import { CarBookingBreadcrumbs } from "@/features/travel/components/car-booking/car-booking-breadcrumbs";
import { CarBookingStepper } from "@/features/travel/components/car-booking/car-booking-stepper";
import { BookingPaymentLoader } from "@/features/travel/components/booking/booking-payment-loader";
import type { CarDetail } from "@/features/travel/data/car-booking";

type CarBookingPaymentPageProps = {
  car: CarDetail;
};

export function CarBookingPaymentPage({ car }: CarBookingPaymentPageProps) {
  const router = useRouter();
  const currentStep: CarBookingStepId = "payment";

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      router.push(`/car-rentals/${car.id}/book/confirmation`);
    }, 3000);

    return () => window.clearTimeout(timeout);
  }, [car.id, router]);

  return (
    <div className="bg-[#F5F5F5]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mt-15 flex w-full flex-col justify-between gap-3 border-b border-[#CCCCCC] pb-5.5 md:flex-row md:items-center">
          <CarBookingBreadcrumbs carName={car.name} />
          <CarBookingStepper carId={car.id} currentStep={currentStep} />
        </div>

        <BookingPaymentLoader />
      </div>
    </div>
  );
}
