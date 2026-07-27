"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { CarBookingStepId } from "@/features/travel/booking/car-constants";
import {
  getDefaultCheckInDate,
  serializeBookingParams,
} from "@/features/travel/booking/booking-params";
import { AboutThisCar, CarGallery } from "@/features/travel/components/car-booking/car-gallery";
import { CarBookingBreadcrumbs } from "@/features/travel/components/car-booking/car-booking-breadcrumbs";
import { CarBookingStepper } from "@/features/travel/components/car-booking/car-booking-stepper";
import { CarBookingSummaryCard } from "@/features/travel/components/car-booking/car-booking-summary-card";
import { CarDatesSection } from "@/features/travel/components/car-booking/car-dates-section";
import { ProductReviewsModalHost } from "@/features/travel/components/booking/product-reviews-modal-host";
import { NoReviewsCard } from "@/features/travel/components/car-booking/no-reviews-card";
import { PackageSelectionTable } from "@/features/travel/components/car-booking/package-selection-table";
import { CarBookingCheckoutPage } from "@/features/travel/components/car-booking/car-booking-checkout-page";
import { CarBookingConfirmationPage } from "@/features/travel/components/car-booking/car-booking-confirmation-page";
import { CarBookingPaymentPage } from "@/features/travel/components/car-booking/car-booking-payment-page";
import type { CarDetail } from "@/features/travel/data/car-booking";

type CarBookingPageProps = {
  car: CarDetail;
  currentStep?: CarBookingStepId;
};

export function CarBookingPage({
  car,
  currentStep = "choose-car",
}: CarBookingPageProps) {
  const router = useRouter();
  const defaultPackageId = car.packages[0]?.id ?? "";

  const [selectedPackageId, setSelectedPackageId] = useState(defaultPackageId);
  const [pickupDate, setPickupDate] = useState(getDefaultCheckInDate());
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [days, setDays] = useState(1);

  const handleBookNow = () => {
    const params = serializeBookingParams({
      package: selectedPackageId,
      date: pickupDate,
      time: selectedTime,
      days,
      guests: 1,
      rooms: 1,
    });
    router.push(`/car-rentals/${car.id}/book/checkout?${params.toString()}`);
  };

  if (currentStep === "checkout") {
    return <CarBookingCheckoutPage car={car} />;
  }

  if (currentStep === "payment") {
    return <CarBookingPaymentPage car={car} />;
  }

  if (currentStep === "confirmation") {
    return <CarBookingConfirmationPage car={car} />;
  }

  return (
    <div className="bg-[#F5F5F5]">
      <ProductReviewsModalHost
        productId={car.id}
        rating={car.rating}
        reviewCount={car.reviewCount}
      />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mt-15 flex w-full flex-col justify-between gap-3 border-b border-[#CCCCCC] pb-5.5 md:flex-row md:items-center">
          <CarBookingBreadcrumbs carName={car.name} />
          <CarBookingStepper carId={car.id} currentStep={currentStep} />
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-8">
            <CarGallery car={car} />
            <AboutThisCar car={car} />
            <CarDatesSection
              carId={car.id}
              pickupDate={pickupDate}
              days={days}
              selectedTime={selectedTime}
              onPickupDateChange={setPickupDate}
              onDaysChange={setDays}
              onTimeChange={setSelectedTime}
            />
            <PackageSelectionTable
              packages={car.packages}
              selectedPackageId={selectedPackageId}
              currency={car.currency}
              onSelectPackage={setSelectedPackageId}
            />
          </div>

          <aside className="space-y-5 xl:sticky xl:top-10 xl:self-start">
            <CarBookingSummaryCard
              car={car}
              packages={car.packages}
              selectedPackageId={selectedPackageId}
              days={days}
              onSelectPackage={setSelectedPackageId}
              onBookNow={handleBookNow}
            />
            <NoReviewsCard />
          </aside>
        </div>
      </div>
    </div>
  );
}
