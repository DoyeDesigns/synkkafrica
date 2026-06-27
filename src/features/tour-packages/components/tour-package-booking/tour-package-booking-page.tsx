"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { TourPackageBookingStepId } from "@/features/tour-packages/booking/tour-package-constants";
import { TourPackageBookingBreadcrumbs } from "@/features/tour-packages/components/tour-package-booking/tour-package-booking-breadcrumbs";
import { TourPackageBookingCheckoutPage } from "@/features/tour-packages/components/tour-package-booking/tour-package-booking-checkout-page";
import { TourPackageBookingConfirmationPage } from "@/features/tour-packages/components/tour-package-booking/tour-package-booking-confirmation-page";
import { TourPackageBookingPaymentPage } from "@/features/tour-packages/components/tour-package-booking/tour-package-booking-payment-page";
import { TourPackageBookingStepper } from "@/features/tour-packages/components/tour-package-booking/tour-package-booking-stepper";
import { TourPackageBookingSummaryCard } from "@/features/tour-packages/components/tour-package-booking/tour-package-booking-summary-card";
import {
  AboutThisTourPackage,
  TourPackageGallery,
} from "@/features/tour-packages/components/tour-package-booking/tour-package-gallery";
import { TierSelectionTable } from "@/features/tour-packages/components/tour-package-booking/tier-selection-table";
import type { TourPackageDetail } from "@/features/tour-packages/data/tour-package-booking";
import { NoReviewsCard } from "@/features/travel/components/car-booking/no-reviews-card";

type TourPackageBookingPageProps = {
  tourPackage: TourPackageDetail;
  currentStep?: TourPackageBookingStepId;
};

export function TourPackageBookingPage({
  tourPackage,
  currentStep = "choose-package",
}: TourPackageBookingPageProps) {
  const router = useRouter();
  const defaultTierId = tourPackage.tiers[0]?.id ?? "";
  const [selectedTierId, setSelectedTierId] = useState(defaultTierId);

  const handleBookNow = () => {
    const params = new URLSearchParams({ tier: selectedTierId });
    router.push(
      `/tour-packages/${tourPackage.id}/book/checkout?${params.toString()}`,
    );
  };

  if (currentStep === "checkout") {
    return <TourPackageBookingCheckoutPage tourPackage={tourPackage} />;
  }

  if (currentStep === "payment") {
    return <TourPackageBookingPaymentPage tourPackage={tourPackage} />;
  }

  if (currentStep === "confirmation") {
    return <TourPackageBookingConfirmationPage tourPackage={tourPackage} />;
  }

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

        <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-8">
            <TourPackageGallery tourPackage={tourPackage} />
            <AboutThisTourPackage tourPackage={tourPackage} />
            <TierSelectionTable
              tiers={tourPackage.tiers}
              selectedTierId={selectedTierId}
              currency={tourPackage.currency}
              onSelectTier={setSelectedTierId}
            />
          </div>

          <aside className="space-y-5 xl:sticky xl:top-10 xl:self-start">
            <TourPackageBookingSummaryCard
              tourPackage={tourPackage}
              tiers={tourPackage.tiers}
              selectedTierId={selectedTierId}
              onSelectTier={setSelectedTierId}
              onBookNow={handleBookNow}
            />
            <NoReviewsCard />
          </aside>
        </div>
      </div>
    </div>
  );
}
