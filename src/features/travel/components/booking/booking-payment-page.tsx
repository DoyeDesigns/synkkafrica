"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import type { BookingStepId } from "@/features/travel/booking/constants";
import { BookingBreadcrumbs } from "@/features/travel/components/booking/booking-breadcrumbs";
import { BookingPaymentLoader } from "@/features/travel/components/booking/booking-payment-loader";
import { BookingStepper } from "@/features/travel/components/booking/booking-stepper";
import type { PropertyDetail } from "@/features/travel/data/property-booking";

type BookingPaymentPageProps = {
  property: PropertyDetail;
};

export function BookingPaymentPage({ property }: BookingPaymentPageProps) {
  const router = useRouter();
  const currentStep: BookingStepId = "payment";

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      router.push(`/accommodations/${property.id}/book/confirmation`);
    }, 3000);

    return () => window.clearTimeout(timeout);
  }, [property.id, router]);

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
