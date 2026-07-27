"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { BookingStepId } from "@/features/travel/booking/constants";
import {
  calculateNights,
  getDefaultCheckInDate,
  getDefaultCheckOutDate,
  serializeBookingParams,
} from "@/features/travel/booking/booking-params";
import { AmenitiesFacilitiesSection } from "@/features/travel/components/booking/amenities-facilities-section";
import { BookingCheckoutPage } from "@/features/travel/components/booking/booking-checkout-page";
import { BookingConfirmationPage } from "@/features/travel/components/booking/booking-confirmation-page";
import { BookingPaymentPage } from "@/features/travel/components/booking/booking-payment-page";
import { BookingBreadcrumbs } from "@/features/travel/components/booking/booking-breadcrumbs";
import { BookingDatesSection } from "@/features/travel/components/booking/booking-dates-section";
import { BookingStepper } from "@/features/travel/components/booking/booking-stepper";
import { BookingSummaryCard } from "@/features/travel/components/booking/booking-summary-card";
import { CurrentOffersSection } from "@/features/travel/components/booking/current-offers-section";
import { PropertyDescription, PropertyGallery, PropertyHeader } from "@/features/travel/components/booking/property-gallery";
import { PropertyMap } from "@/features/travel/components/booking/property-map";
import { ReviewsCarousel } from "@/features/travel/components/booking/reviews-carousel";
import { RoomSelectionTable } from "@/features/travel/components/booking/room-selection-table";
import type { PropertyDetail } from "@/features/travel/data/property-booking";
import { OngoingDealsSection } from "../landing/accommodations/ongoing-deals-section";
import { ACCOMMODATION_DEALS } from "../../data/accommodations-landing";

type PropertyBookingPageProps = {
  property: PropertyDetail;
  currentStep?: BookingStepId;
};

export function PropertyBookingPage({
  property,
  currentStep = "rooms",
}: PropertyBookingPageProps) {
  const router = useRouter();
  const defaultRoomId = property.rooms[0]?.id ?? "";

  const [selectedRoomId, setSelectedRoomId] = useState(defaultRoomId);
  const [checkIn, setCheckIn] = useState(getDefaultCheckInDate);
  const [checkOut, setCheckOut] = useState(getDefaultCheckOutDate);
  const [guests, setGuests] = useState(2);
  const [roomCount, setRoomCount] = useState(1);
  const [selectedTime, setSelectedTime] = useState("09:00");

  const nights = useMemo(
    () => calculateNights(checkIn, checkOut),
    [checkIn, checkOut],
  );

  const handleBookNow = () => {
    const params = serializeBookingParams({
      room: selectedRoomId,
      checkIn,
      checkOut,
      guests,
      rooms: roomCount,
      time: selectedTime,
      days: nights,
    });
    router.push(`/accommodations/${property.id}/book/checkout?${params.toString()}`);
  };

  if (currentStep === "checkout") {
    return <BookingCheckoutPage property={property} />;
  }

  if (currentStep === "payment") {
    return <BookingPaymentPage property={property} />;
  }

  if (currentStep === "confirmation") {
    return <BookingConfirmationPage property={property} />;
  }

  return (
    <div>
      <div className="bg-[#F5F5F5]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex gap-3 md:items-center flex-col md:flex-row justify-between! mt-15 w-full border-b border-[#CCCCCC] pb-5.5">
        <BookingBreadcrumbs propertyName={property.name} />
        <BookingStepper propertyId={property.id} currentStep={currentStep} />
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-8">
          <PropertyHeader property={property} />
          <PropertyGallery property={property} />
          <PropertyDescription property={property} />

          <BookingDatesSection
            propertyId={property.id}
            checkIn={checkIn}
            checkOut={checkOut}
            guests={guests}
            rooms={roomCount}
            selectedTime={selectedTime}
            onCheckInChange={setCheckIn}
            onCheckOutChange={setCheckOut}
            onGuestsChange={setGuests}
            onRoomsChange={setRoomCount}
            onTimeChange={setSelectedTime}
          />

          <RoomSelectionTable
            rooms={property.rooms}
            selectedRoomId={selectedRoomId}
            currency={property.currency}
            onSelectRoom={setSelectedRoomId}
          />

          <div className="xl:hidden space-y-6">
            <ReviewsCarousel
              productId={property.id}
              reviews={property.reviews}
              rating={property.rating}
              reviewCount={property.reviewCount}
            />
            <PropertyMap
              coordinates={property.mapCoordinates}
              label={property.name}
            />
          </div>
          <CurrentOffersSection offers={property.offers} />
        </div>

        <aside className="space-y-5 xl:sticky xl:top-10 xl:self-start">
          <div className="hidden space-y-5 xl:block">
            <ReviewsCarousel
              productId={property.id}
              reviews={property.reviews}
              rating={property.rating}
              reviewCount={property.reviewCount}
            />
            <PropertyMap
              coordinates={property.mapCoordinates}
              label={property.name}
            />
          </div>
          <BookingSummaryCard
            property={property}
            rooms={property.rooms}
            selectedRoomId={selectedRoomId}
            nights={nights}
            roomCount={roomCount}
            guestCount={guests}
            onSelectRoom={setSelectedRoomId}
            onBookNow={handleBookNow}
          />
        </aside>
      </div>
    </div>
    </div>

    <div className="bg-white">
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <AmenitiesFacilitiesSection amenities={property.amenities} />
    </div>
    </div>

    <div className="bg-[#F5F5F5]">
    <div className="mx-auto max-w-7xl px-4 py-25 sm:px-6 lg:px-8">
      <OngoingDealsSection items={ACCOMMODATION_DEALS} />
    </div>
    </div>
    </div>
  );
}
