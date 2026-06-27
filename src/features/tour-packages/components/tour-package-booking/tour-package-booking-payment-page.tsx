"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import type { TourPackageBookingStepId } from "@/features/tour-packages/booking/tour-package-constants";
import { TourPackageBookingBreadcrumbs } from "@/features/tour-packages/components/tour-package-booking/tour-package-booking-breadcrumbs";
import { TourPackageBookingStepper } from "@/features/tour-packages/components/tour-package-booking/tour-package-booking-stepper";
import { BookingPaymentLoader } from "@/features/travel/components/booking/booking-payment-loader";
import type { TourPackageDetail } from "@/features/tour-packages/data/tour-package-booking";

type TourPackageBookingPaymentPageProps = {
  tourPackage: TourPackageDetail;
};

export function TourPackageBookingPaymentPage({
  tourPackage,
}: TourPackageBookingPaymentPageProps) {
  const router = useRouter();
  const currentStep: TourPackageBookingStepId = "payment";

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      router.push(`/tour-packages/${tourPackage.id}/book/confirmation`);
    }, 3000);

    return () => window.clearTimeout(timeout);
  }, [tourPackage.id, router]);

  return (
    <div className="bg-[#F5F5F5]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mt-15 flex w-full flex-col justify-between gap-3 border-b border-[#CCCCCC] pb-5.5 md:flex-row md:items-center">
          <TourPackageBookingBreadcrumbs packageTitle={tourPackage.title} />
          <TourPackageBookingStepper
            packageId={tourPackage.id}
            currentStep={currentStep}
          />
        </div>

        <BookingPaymentLoader />
      </div>
    </div>
  );
}
