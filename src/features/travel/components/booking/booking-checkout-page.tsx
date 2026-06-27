"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import type { BookingStepId } from "@/features/travel/booking/constants";
import { BookingBreadcrumbs } from "@/features/travel/components/booking/booking-breadcrumbs";
import { BookingStepper } from "@/features/travel/components/booking/booking-stepper";
import { BookingSummaryCard } from "@/features/travel/components/booking/booking-summary-card";
import { GuestDetailsForm } from "@/features/travel/components/booking/guest-details-form";
import type { PropertyDetail } from "@/features/travel/data/property-booking";

type BookingCheckoutPageProps = {
  property: PropertyDetail;
};

function getDefaultCheckInDate() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().split("T")[0] ?? "";
}

function getDefaultCheckOutDate() {
  const date = new Date();
  date.setDate(date.getDate() + 8);
  return date.toISOString().split("T")[0] ?? "";
}

function calculateNights(checkIn: string, checkOut: string) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end.getTime() - start.getTime();
  const nights = Math.ceil(diff / (1000 * 60 * 60 * 24));

  return Number.isFinite(nights) && nights > 0 ? nights : 1;
}

export function BookingCheckoutPage({ property }: BookingCheckoutPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStep: BookingStepId = "checkout";

  const initialRoomId = useMemo(() => {
    const fromQuery = searchParams.get("room");
    const isValid = property.rooms.some((room) => room.id === fromQuery);

    return isValid && fromQuery ? fromQuery : (property.rooms[0]?.id ?? "");
  }, [property.rooms, searchParams]);

  const [selectedRoomId, setSelectedRoomId] = useState(initialRoomId);
  const [checkIn] = useState(getDefaultCheckInDate);
  const [checkOut] = useState(getDefaultCheckOutDate);
  const [roomCount] = useState(1);

  const nights = useMemo(
    () => calculateNights(checkIn, checkOut),
    [checkIn, checkOut],
  );

  const handleProceedToPay = () => {
    const params = new URLSearchParams({ room: selectedRoomId });
    router.push(`/accommodations/${property.id}/book/payment?${params.toString()}`);
  };

  return (
    <div className="bg-[#F5F5F5]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mt-15 flex w-full flex-col justify-between gap-3 border-b border-[#CCCCCC] pb-5.5 md:flex-row md:items-center">
          <BookingBreadcrumbs propertyName={property.name} />
          <BookingStepper propertyId={property.id} currentStep={currentStep} />
        </div>

        <div className="mt-8 grid gap-2 xl:grid-cols-[minmax(0,1fr)_340px]">
          <GuestDetailsForm />

          <div>
            <div className="xl:sticky xl:top-10">
              <BookingSummaryCard
                property={property}
                rooms={property.rooms}
                selectedRoomId={selectedRoomId}
                nights={nights}
                roomCount={roomCount}
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
