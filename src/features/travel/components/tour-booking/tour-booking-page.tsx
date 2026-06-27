"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { TourBookingStepId } from "@/features/travel/booking/tour-constants";
import { NoReviewsCard } from "@/features/travel/components/car-booking/no-reviews-card";
import { TourBookingBreadcrumbs } from "@/features/travel/components/tour-booking/tour-booking-breadcrumbs";
import { TourBookingCheckoutPage } from "@/features/travel/components/tour-booking/tour-booking-checkout-page";
import { TourBookingConfirmationPage } from "@/features/travel/components/tour-booking/tour-booking-confirmation-page";
import { TourBookingPaymentPage } from "@/features/travel/components/tour-booking/tour-booking-payment-page";
import { TourBookingStepper } from "@/features/travel/components/tour-booking/tour-booking-stepper";
import { TourBookingSummaryCard } from "@/features/travel/components/tour-booking/tour-booking-summary-card";
import { ExperienceSelectionTable } from "@/features/travel/components/tour-booking/experience-selection-table";
import { AboutThisTour, TourGallery } from "@/features/travel/components/tour-booking/tour-gallery";
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

  const handleBookNow = () => {
    const params = new URLSearchParams({ option: selectedOptionId });
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
            <ExperienceSelectionTable
              options={tour.options}
              selectedOptionId={selectedOptionId}
              currency={tour.currency}
              onSelectOption={setSelectedOptionId}
            />
          </div>

          <aside className="space-y-5 xl:sticky xl:top-10 xl:self-start">
            <TourBookingSummaryCard
              tour={tour}
              options={tour.options}
              selectedOptionId={selectedOptionId}
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
