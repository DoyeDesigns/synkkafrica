"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import type { TourPackageBookingStepId } from "@/features/tour-packages/booking/tour-package-constants";
import { TourPackageBookingBreadcrumbs } from "@/features/tour-packages/components/tour-package-booking/tour-package-booking-breadcrumbs";
import { TourPackageBookingStepper } from "@/features/tour-packages/components/tour-package-booking/tour-package-booking-stepper";
import { TourPackageBookingSummaryCard } from "@/features/tour-packages/components/tour-package-booking/tour-package-booking-summary-card";
import type { TourPackageDetail } from "@/features/tour-packages/data/tour-package-booking";
import { parseBookingParams, serializeBookingParams } from "@/features/travel/booking/booking-params";
import { GuestDetailsForm } from "@/features/travel/components/booking/guest-details-form";
import { useGuestCheckoutGate } from "@/features/travel/hooks/use-guest-checkout-gate";
import { useTranslation } from "@/hooks/use-translation";

type TourPackageBookingCheckoutPageProps = {
  tourPackage: TourPackageDetail;
};

function TourPackageBookingCheckoutPageContent({
  tourPackage,
}: TourPackageBookingCheckoutPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslation();
  const currentStep: TourPackageBookingStepId = "checkout";
  const bookingParams = parseBookingParams(searchParams);
  const { identity, setIdentity, identityErrors, guardProceed } =
    useGuestCheckoutGate();

  const initialTierId = useMemo(() => {
    const fromQuery = bookingParams.tier;
    const isValid = tourPackage.tiers.some((tier) => tier.id === fromQuery);

    return isValid && fromQuery ? fromQuery : (tourPackage.tiers[0]?.id ?? "");
  }, [bookingParams.tier, tourPackage.tiers]);

  const [selectedTierId, setSelectedTierId] = useState(initialTierId);
  const [guestCount, setGuestCount] = useState(bookingParams.guests);
  const [specialRequests, setSpecialRequests] = useState(
    bookingParams.specialRequests ?? "",
  );
  const days = bookingParams.days ?? tourPackage.days;

  const handleProceedToPay = () => {
    guardProceed(() => {
      const params = serializeBookingParams({
        tier: selectedTierId,
        days,
        guests: guestCount,
        rooms: 1,
        specialRequests,
      });
      router.push(
        `/tour-packages/${tourPackage.id}/book/payment?${params.toString()}`,
      );
    });
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
          <GuestDetailsForm
            guestCount={guestCount}
            onGuestCountChange={setGuestCount}
            specialRequests={specialRequests}
            onSpecialRequestsChange={setSpecialRequests}
            identity={identity}
            onIdentityChange={setIdentity}
            identityErrors={identityErrors}
          />

          <div>
            <div className="xl:sticky xl:top-10">
              {Object.keys(identityErrors).length > 0 ? (
                <p className="mb-3 rounded-md bg-[#FFF1EA] px-4 py-3 text-sm font-medium font-inter text-[#D85A30]">
                  {t("booking.guest.idValidationRequired")}
                </p>
              ) : null}
              <TourPackageBookingSummaryCard
                tourPackage={tourPackage}
                tiers={tourPackage.tiers}
                selectedTierId={selectedTierId}
                days={days}
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

export function TourPackageBookingCheckoutPage(
  props: TourPackageBookingCheckoutPageProps,
) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F5F5]" />}>
      <TourPackageBookingCheckoutPageContent {...props} />
    </Suspense>
  );
}
