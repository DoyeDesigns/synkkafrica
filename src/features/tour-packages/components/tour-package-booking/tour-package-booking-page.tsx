"use client";

import { useRouter } from "next/navigation";

import type { TourPackageBookingStepId } from "@/features/tour-packages/booking/tour-package-constants";
import { serializeBookingParams } from "@/features/travel/booking/booking-params";
import { TourPackageBookingBreadcrumbs } from "@/features/tour-packages/components/tour-package-booking/tour-package-booking-breadcrumbs";
import { TourPackageBookingCheckoutPage } from "@/features/tour-packages/components/tour-package-booking/tour-package-booking-checkout-page";
import { TourPackageBookingConfirmationPage } from "@/features/tour-packages/components/tour-package-booking/tour-package-booking-confirmation-page";
import { TourPackageBookingPaymentPage } from "@/features/tour-packages/components/tour-package-booking/tour-package-booking-payment-page";
import { TourPackageBookingStepper } from "@/features/tour-packages/components/tour-package-booking/tour-package-booking-stepper";
import { TourPackageCancellationBanner } from "@/features/tour-packages/components/tour-package-booking/tour-package-cancellation-banner";
import {
  TourPackageGallery,
  TourPackageHeader,
} from "@/features/tour-packages/components/tour-package-booking/tour-package-gallery";
import { TourPackageHighlightsBar } from "@/features/tour-packages/components/tour-package-booking/tour-package-highlights-bar";
import { TourPackageIncludedSection } from "@/features/tour-packages/components/tour-package-booking/tour-package-included-section";
import { TourPackagePriceBreakdownSection } from "@/features/tour-packages/components/tour-package-booking/tour-package-price-breakdown-section";
import { TourPackageWhyBookSection } from "@/features/tour-packages/components/tour-package-booking/tour-package-why-book-section";
import type { TourPackageDetail } from "@/features/tour-packages/data/tour-package-booking";

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

  const handleBookNow = () => {
    const params = serializeBookingParams({
      tier: defaultTierId,
      days: tourPackage.days,
      guests: tourPackage.minGuests,
      rooms: 1,
    });
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

        <div className="mt-8 space-y-8">
          <TourPackageHeader tourPackage={tourPackage} />
          <TourPackageGallery tourPackage={tourPackage} />
          <TourPackageHighlightsBar tourPackage={tourPackage} />
          <TourPackageIncludedSection tourPackage={tourPackage} />
          <TourPackagePriceBreakdownSection
            tourPackage={tourPackage}
            onBookNow={handleBookNow}
          />
          <TourPackageWhyBookSection tourPackage={tourPackage} />
          <TourPackageCancellationBanner tourPackage={tourPackage} />
        </div>
      </div>
    </div>
  );
}
