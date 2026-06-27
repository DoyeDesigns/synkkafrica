"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import type { CarBookingStepId } from "@/features/travel/booking/car-constants";
import { CarBookingBreadcrumbs } from "@/features/travel/components/car-booking/car-booking-breadcrumbs";
import { CarBookingStepper } from "@/features/travel/components/car-booking/car-booking-stepper";
import { CarBookingSummaryCard } from "@/features/travel/components/car-booking/car-booking-summary-card";
import { GuestDetailsForm } from "@/features/travel/components/booking/guest-details-form";
import type { CarDetail } from "@/features/travel/data/car-booking";

type CarBookingCheckoutPageProps = {
  car: CarDetail;
};

export function CarBookingCheckoutPage({ car }: CarBookingCheckoutPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStep: CarBookingStepId = "checkout";

  const initialPackageId = useMemo(() => {
    const fromQuery = searchParams.get("package");
    const isValid = car.packages.some((pkg) => pkg.id === fromQuery);

    return isValid && fromQuery ? fromQuery : (car.packages[0]?.id ?? "");
  }, [car.packages, searchParams]);

  const [selectedPackageId, setSelectedPackageId] = useState(initialPackageId);

  const handleProceedToPay = () => {
    const params = new URLSearchParams({ package: selectedPackageId });
    router.push(`/car-rentals/${car.id}/book/payment?${params.toString()}`);
  };

  return (
    <div className="bg-[#F5F5F5]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mt-15 flex w-full flex-col justify-between gap-3 border-b border-[#CCCCCC] pb-5.5 md:flex-row md:items-center">
          <CarBookingBreadcrumbs carName={car.name} />
          <CarBookingStepper carId={car.id} currentStep={currentStep} />
        </div>

        <div className="mt-8 grid gap-2 xl:grid-cols-[minmax(0,1fr)_340px]">
          <GuestDetailsForm />

          <div>
            <div className="xl:sticky xl:top-10">
              <CarBookingSummaryCard
                car={car}
                packages={car.packages}
                selectedPackageId={selectedPackageId}
                onSelectPackage={setSelectedPackageId}
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
