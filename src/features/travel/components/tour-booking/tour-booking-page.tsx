"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { TourBookingStepId } from "@/features/travel/booking/tour-constants";
import {
  getDefaultCheckInDate,
  serializeBookingParams,
} from "@/features/travel/booking/booking-params";
import { NoReviewsCard } from "@/features/travel/components/car-booking/no-reviews-card";
import { TourBookingBreadcrumbs } from "@/features/travel/components/tour-booking/tour-booking-breadcrumbs";
import { TourBookingCheckoutPage } from "@/features/travel/components/tour-booking/tour-booking-checkout-page";
import { TourBookingConfirmationPage } from "@/features/travel/components/tour-booking/tour-booking-confirmation-page";
import { TourBookingPaymentPage } from "@/features/travel/components/tour-booking/tour-booking-payment-page";
import { TourBookingStepper } from "@/features/travel/components/tour-booking/tour-booking-stepper";
import { TourBookingSummaryCard } from "@/features/travel/components/tour-booking/tour-booking-summary-card";
import { TourDatesSection } from "@/features/travel/components/tour-booking/tour-dates-section";
import { ExperienceSelectionTable } from "@/features/travel/components/tour-booking/experience-selection-table";
import { AboutThisTour, TourGallery } from "@/features/travel/components/tour-booking/tour-gallery";
import { TourExperienceReviews } from "@/features/travel/components/tour-booking/tour-experience-reviews";
import type { TourDetail } from "@/features/travel/data/tour-booking";

type TourBookingPageProps = {
  tour: TourDetail;
  currentStep?: TourBookingStepId;
};

export function TourBookingPage({
  tour,
  currentStep = "choose-experience",
}: TourBookingPageProps) {
  const router = useRouter();
  const defaultOptionId = tour.options[0]?.id ?? "";
  const [selectedOptionId, setSelectedOptionId] = useState(defaultOptionId);
  const [selectedDate, setSelectedDate] = useState(getDefaultCheckInDate());
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [guests, setGuests] = useState(2);
  const [days, setDays] = useState(1);

  const handleBookNow = () => {
    const params = serializeBookingParams({
      option: selectedOptionId,
      date: selectedDate,
      time: selectedTime,
      guests,
      days,
      rooms: 1,
    });
    router.push(`/tours/${tour.id}/book/checkout?${params.toString()}`);
  };

  if (currentStep === "checkout") {
    return <TourBookingCheckoutPage tour={tour} />;
  }

  if (currentStep === "payment") {
    return <TourBookingPaymentPage tour={tour} />;
  }

  if (currentStep === "confirmation") {
    return <TourBookingConfirmationPage tour={tour} />;
  }

  return (
    <div className="bg-[#F5F5F5]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mt-15 flex w-full flex-col justify-between gap-3 border-b border-[#CCCCCC] pb-5.5 md:flex-row md:items-center">
          <TourBookingBreadcrumbs tourTitle={tour.title} />
          <TourBookingStepper tourId={tour.id} currentStep={currentStep} />
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-8">
            <TourGallery tour={tour} />
            <AboutThisTour tour={tour} />
            <TourDatesSection
              tourId={tour.id}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              guests={guests}
              days={days}
              onDateChange={setSelectedDate}
              onTimeChange={setSelectedTime}
              onGuestsChange={setGuests}
              onDaysChange={setDays}
            />
            <ExperienceSelectionTable
              options={tour.options}
              selectedOptionId={selectedOptionId}
              currency={tour.currency}
              onSelectOption={setSelectedOptionId}
            />
            <TourExperienceReviews tour={tour} />
          </div>

          <aside className="space-y-5 xl:sticky xl:top-10 xl:self-start">
            <TourBookingSummaryCard
              tour={tour}
              options={tour.options}
              selectedOptionId={selectedOptionId}
              guestCount={guests}
              days={days}
              onSelectOption={setSelectedOptionId}
              onBookNow={handleBookNow}
            />
            <NoReviewsCard />
          </aside>
        </div>
      </div>
    </div>
  );
}
