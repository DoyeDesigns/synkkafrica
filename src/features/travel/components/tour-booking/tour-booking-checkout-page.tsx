"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import type { TourBookingStepId } from "@/features/travel/booking/tour-constants";
import { GuestDetailsForm } from "@/features/travel/components/booking/guest-details-form";
import { TourBookingBreadcrumbs } from "@/features/travel/components/tour-booking/tour-booking-breadcrumbs";
import { TourBookingStepper } from "@/features/travel/components/tour-booking/tour-booking-stepper";
import { TourBookingSummaryCard } from "@/features/travel/components/tour-booking/tour-booking-summary-card";
import type { TourDetail } from "@/features/travel/data/tour-booking";

type TourBookingCheckoutPageProps = {
  tour: TourDetail;
};

export function TourBookingCheckoutPage({ tour }: TourBookingCheckoutPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStep: TourBookingStepId = "checkout";

  const initialOptionId = useMemo(() => {
    const fromQuery = searchParams.get("option");
    const isValid = tour.options.some((option) => option.id === fromQuery);

    return isValid && fromQuery ? fromQuery : (tour.options[0]?.id ?? "");
  }, [tour.options, searchParams]);

  const [selectedOptionId, setSelectedOptionId] = useState(initialOptionId);

  const handleProceedToPay = () => {
    const params = new URLSearchParams({ option: selectedOptionId });
    router.push(`/tours/${tour.id}/book/payment?${params.toString()}`);
  };

  return (
    <div className="bg-[#F5F5F5]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mt-15 flex w-full flex-col justify-between gap-3 border-b border-[#CCCCCC] pb-5.5 md:flex-row md:items-center">
          <TourBookingBreadcrumbs tourTitle={tour.title} />
          <TourBookingStepper tourId={tour.id} currentStep={currentStep} />
        </div>

        <div className="mt-8 grid gap-2 xl:grid-cols-[minmax(0,1fr)_340px]">
          <GuestDetailsForm />

          <div>
            <div className="xl:sticky xl:top-10">
              <TourBookingSummaryCard
                tour={tour}
                options={tour.options}
                selectedOptionId={selectedOptionId}
                onSelectOption={setSelectedOptionId}
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
