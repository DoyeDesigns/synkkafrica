"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import type { TourBookingStepId } from "@/features/travel/booking/tour-constants";
import {
  bookingParamsToConfirmationInput,
  createBookingConfirmation,
} from "@/features/travel/booking/booking-confirmation";
import { parseBookingParams } from "@/features/travel/booking/booking-params";
import { calculateTourBookingTotal } from "@/features/travel/booking/calculate-tour-booking-total";
import { BookingPaymentLoader } from "@/features/travel/components/booking/booking-payment-loader";
import { TourBookingBreadcrumbs } from "@/features/travel/components/tour-booking/tour-booking-breadcrumbs";
import { TourBookingStepper } from "@/features/travel/components/tour-booking/tour-booking-stepper";
import type { TourDetail } from "@/features/travel/data/tour-booking";

type TourBookingPaymentPageProps = {
  tour: TourDetail;
};

function TourBookingPaymentPageContent({ tour }: TourBookingPaymentPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStep: TourBookingStepId = "payment";
  const query = searchParams.toString();

  useEffect(() => {
    const bookingParams = parseBookingParams(searchParams);
    const selectedOption =
      tour.options.find((option) => option.id === bookingParams.option) ??
      tour.options[0];
    const pricing = selectedOption
      ? calculateTourBookingTotal({
          optionPrice: selectedOption.price,
          guestCount: bookingParams.guests,
          taxesAndFees: tour.taxesAndFees,
          currency: tour.currency,
          optionName: selectedOption.name,
        })
      : null;

    const timeout = window.setTimeout(() => {
      createBookingConfirmation(
        bookingParamsToConfirmationInput(bookingParams, {
          type: "tour",
          id: tour.id,
          name: tour.title,
          total: pricing?.total,
          currency: tour.currency,
        }),
      );

      router.push(
        `/tours/${tour.id}/book/confirmation?${searchParams.toString()}`,
      );
    }, 3000);

    return () => window.clearTimeout(timeout);
  }, [tour, router, query, searchParams]);

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

export function TourBookingPaymentPage(props: TourBookingPaymentPageProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F5F5]" />}>
      <TourBookingPaymentPageContent {...props} />
    </Suspense>
  );
}
