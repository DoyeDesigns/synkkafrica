"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import type { TourPackageBookingStepId } from "@/features/tour-packages/booking/tour-package-constants";
import { TourPackageBookingBreadcrumbs } from "@/features/tour-packages/components/tour-package-booking/tour-package-booking-breadcrumbs";
import { TourPackageBookingStepper } from "@/features/tour-packages/components/tour-package-booking/tour-package-booking-stepper";
import { TourPackageBookingSummaryCard } from "@/features/tour-packages/components/tour-package-booking/tour-package-booking-summary-card";
import type { TourPackageDetail } from "@/features/tour-packages/data/tour-package-booking";
import { GuestDetailsForm } from "@/features/travel/components/booking/guest-details-form";

type TourPackageBookingCheckoutPageProps = {
  tourPackage: TourPackageDetail;
};

export function TourPackageBookingCheckoutPage({
  tourPackage,
}: TourPackageBookingCheckoutPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStep: TourPackageBookingStepId = "checkout";

  const initialTierId = useMemo(() => {
    const fromQuery = searchParams.get("tier");
    const isValid = tourPackage.tiers.some((tier) => tier.id === fromQuery);

    return isValid && fromQuery ? fromQuery : (tourPackage.tiers[0]?.id ?? "");
  }, [tourPackage.tiers, searchParams]);

  const [selectedTierId, setSelectedTierId] = useState(initialTierId);

  const handleProceedToPay = () => {
    const params = new URLSearchParams({ tier: selectedTierId });
    router.push(
      `/tour-packages/${tourPackage.id}/book/payment?${params.toString()}`,
    );
  };

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

        <div className="mt-8 grid gap-2 xl:grid-cols-[minmax(0,1fr)_340px]">
          <GuestDetailsForm />

          <div>
            <div className="xl:sticky xl:top-10">
              <TourPackageBookingSummaryCard
                tourPackage={tourPackage}
                tiers={tourPackage.tiers}
                selectedTierId={selectedTierId}
                onSelectTier={setSelectedTierId}
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
