"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import type { BookingStepId } from "@/features/travel/booking/constants";
import {
  calculateNights,
  getDefaultCheckInDate,
  getDefaultCheckOutDate,
  parseBookingParams,
  serializeBookingParams,
} from "@/features/travel/booking/booking-params";
import { BookingBreadcrumbs } from "@/features/travel/components/booking/booking-breadcrumbs";
import { BookingStepper } from "@/features/travel/components/booking/booking-stepper";
import { BookingSummaryCard } from "@/features/travel/components/booking/booking-summary-card";
import { GuestDetailsForm } from "@/features/travel/components/booking/guest-details-form";
import type { PropertyDetail } from "@/features/travel/data/property-booking";
import { useGuestCheckoutGate } from "@/features/travel/hooks/use-guest-checkout-gate";
import { useTranslation } from "@/hooks/use-translation";

type BookingCheckoutPageProps = {
  property: PropertyDetail;
};

function BookingCheckoutPageContent({ property }: BookingCheckoutPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslation();
  const currentStep: BookingStepId = "checkout";
  const bookingParams = parseBookingParams(searchParams);

  const initialRoomId = useMemo(() => {
    const fromQuery = bookingParams.room;
    const isValid = property.rooms.some((room) => room.id === fromQuery);

    return isValid && fromQuery ? fromQuery : (property.rooms[0]?.id ?? "");
  }, [bookingParams.room, property.rooms]);

  const [selectedRoomId, setSelectedRoomId] = useState(initialRoomId);
  const [guestCount, setGuestCount] = useState(bookingParams.guests);
  const [specialRequests, setSpecialRequests] = useState(
    bookingParams.specialRequests ?? "",
  );
  const {
    identities,
    setIdentityAt,
    identityErrors,
    hasIdentityErrors,
    guardProceed,
  } = useGuestCheckoutGate(guestCount, { leadGuestOnly: true });

  const checkIn = bookingParams.checkIn ?? getDefaultCheckInDate();
  const checkOut = bookingParams.checkOut ?? getDefaultCheckOutDate(checkIn);
  const roomCount = bookingParams.rooms;
  const selectedTime = bookingParams.time ?? "09:00";

  const nights = useMemo(
    () => calculateNights(checkIn, checkOut),
    [checkIn, checkOut],
  );

  const handleProceedToPay = () => {
    guardProceed(() => {
      const params = serializeBookingParams({
        room: selectedRoomId,
        checkIn,
        checkOut,
        guests: guestCount,
        rooms: roomCount,
        time: selectedTime,
        days: nights,
        specialRequests,
      });
      router.push(`/accommodations/${property.id}/book/payment?${params.toString()}`);
    });
  };

  return (
    <div className="bg-[#F5F5F5]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mt-15 flex w-full flex-col justify-between gap-3 border-b border-[#CCCCCC] pb-5.5 md:flex-row md:items-center">
          <BookingBreadcrumbs propertyName={property.name} />
          <BookingStepper propertyId={property.id} currentStep={currentStep} />
        </div>

        <div className="mt-8 grid gap-2 xl:grid-cols-[minmax(0,1fr)_340px]">
          <GuestDetailsForm
            guestCount={guestCount}
            onGuestCountChange={setGuestCount}
            specialRequests={specialRequests}
            onSpecialRequestsChange={setSpecialRequests}
            identities={identities}
            onIdentityChange={setIdentityAt}
            identityErrors={identityErrors}
            leadGuestOnly
          />

          <div>
            <div className="xl:sticky xl:top-10">
              {hasIdentityErrors ? (
                <p className="mb-3 rounded-md bg-[#FFF1EA] px-4 py-3 text-sm font-medium font-inter text-[#D85A30]">
                  {t("booking.guest.idValidationRequired")}
                </p>
              ) : null}
              <BookingSummaryCard
                property={property}
                rooms={property.rooms}
                selectedRoomId={selectedRoomId}
                nights={nights}
                roomCount={roomCount}
                guestCount={guestCount}
                onSelectRoom={setSelectedRoomId}
                onBookNow={handleProceedToPay}
                ctaKey="booking.cta.proceedToPay"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BookingCheckoutPage(props: BookingCheckoutPageProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F5F5]" />}>
      <BookingCheckoutPageContent {...props} />
    </Suspense>
  );
}
