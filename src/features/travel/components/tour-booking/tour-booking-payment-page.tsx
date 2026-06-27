"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import type { TourBookingStepId } from "@/features/travel/booking/tour-constants";
import { BookingPaymentLoader } from "@/features/travel/components/booking/booking-payment-loader";
import { TourBookingBreadcrumbs } from "@/features/travel/components/tour-booking/tour-booking-breadcrumbs";
import { TourBookingStepper } from "@/features/travel/components/tour-booking/tour-booking-stepper";
import type { TourDetail } from "@/features/travel/data/tour-booking";

type TourBookingPaymentPageProps = {
  tour: TourDetail;
};

export function TourBookingPaymentPage({ tour }: TourBookingPaymentPageProps) {
  const router = useRouter();
  const currentStep: TourBookingStepId = "payment";

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      router.push(`/tours/${tour.id}/book/confirmation`);
    }, 3000);

    return () => window.clearTimeout(timeout);
  }, [tour.id, router]);

  return (
    <div className="bg-[#F5F5F5]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mt-15 flex w-full flex-col justify-between gap-3 border-b border-[#CCCCCC] pb-5.5 md:flex-row md:items-center">
          <TourBookingBreadcrumbs tourTitle={tour.title} />
          <TourBookingStepper tourId={tour.id} currentStep={currentStep} />
        </div>

        <BookingPaymentLoader />
      </div>
    </div>
  );
}
