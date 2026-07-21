"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import type { BookingStepId } from "@/features/travel/booking/constants";
import {
  bookingParamsToConfirmationInput,
  createBookingConfirmation,
} from "@/features/travel/booking/booking-confirmation";
import {
  calculateNights,
  getDefaultCheckInDate,
  getDefaultCheckOutDate,
  parseBookingParams,
} from "@/features/travel/booking/booking-params";
import { calculateBookingTotal } from "@/features/travel/booking/calculate-booking-total";
import { BookingBreadcrumbs } from "@/features/travel/components/booking/booking-breadcrumbs";
import { BookingPaymentLoader } from "@/features/travel/components/booking/booking-payment-loader";
import { BookingStepper } from "@/features/travel/components/booking/booking-stepper";
import type { PropertyDetail } from "@/features/travel/data/property-booking";

type BookingPaymentPageProps = {
  property: PropertyDetail;
};

function BookingPaymentPageContent({ property }: BookingPaymentPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStep: BookingStepId = "payment";
  const query = searchParams.toString();

  useEffect(() => {
    const bookingParams = parseBookingParams(searchParams);
    const checkIn = bookingParams.checkIn ?? getDefaultCheckInDate();
    const checkOut = bookingParams.checkOut ?? getDefaultCheckOutDate(checkIn);
    const selectedRoom =
      property.rooms.find((room) => room.id === bookingParams.room) ??
      property.rooms[0];
    const nights = calculateNights(checkIn, checkOut);
    const pricing = selectedRoom
      ? calculateBookingTotal({
          pricePerNight: selectedRoom.pricePerNight,
          nights,
          roomCount: bookingParams.rooms,
          guestCount: bookingParams.guests,
          includedGuests: selectedRoom.guestCount,
          extraGuestFeePerNight: Math.round(selectedRoom.pricePerNight * 0.15),
          taxesAndFees: property.taxesAndFees,
          currency: property.currency,
        })
      : null;

    const timeout = window.setTimeout(() => {
      createBookingConfirmation(
        bookingParamsToConfirmationInput(bookingParams, {
          type: "accommodation",
          id: property.id,
          name: property.name,
          total: pricing?.total,
          currency: property.currency,
        }),
      );

      router.push(
        `/accommodations/${property.id}/book/confirmation?${searchParams.toString()}`,
      );
    }, 3000);

    return () => window.clearTimeout(timeout);
  }, [property, router, query, searchParams]);

  return (
    <div className="bg-[#F5F5F5]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mt-15 flex w-full flex-col justify-between gap-3 border-b border-[#CCCCCC] pb-5.5 md:flex-row md:items-center">
          <BookingBreadcrumbs propertyName={property.name} />
          <BookingStepper propertyId={property.id} currentStep={currentStep} />
        </div>

        <BookingPaymentLoader />
      </div>
    </div>
  );
}

export function BookingPaymentPage(props: BookingPaymentPageProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F5F5]" />}>
      <BookingPaymentPageContent {...props} />
    </Suspense>
  );
}
