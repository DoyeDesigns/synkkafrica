"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import type { CarBookingStepId } from "@/features/travel/booking/car-constants";
import { parseBookingParams, serializeBookingParams } from "@/features/travel/booking/booking-params";
import { CarBookingBreadcrumbs } from "@/features/travel/components/car-booking/car-booking-breadcrumbs";
import { CarBookingStepper } from "@/features/travel/components/car-booking/car-booking-stepper";
import { CarBookingSummaryCard } from "@/features/travel/components/car-booking/car-booking-summary-card";
import { GuestDetailsForm } from "@/features/travel/components/booking/guest-details-form";
import type { CarDetail } from "@/features/travel/data/car-booking";
import { useGuestCheckoutGate } from "@/features/travel/hooks/use-guest-checkout-gate";
import { useTranslation } from "@/hooks/use-translation";

type CarBookingCheckoutPageProps = {
  car: CarDetail;
};

function CarBookingCheckoutPageContent({ car }: CarBookingCheckoutPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslation();
  const currentStep: CarBookingStepId = "checkout";
  const bookingParams = parseBookingParams(searchParams);
  const { identity, setIdentity, identityErrors, guardProceed } =
    useGuestCheckoutGate();

  const initialPackageId = useMemo(() => {
    const fromQuery = bookingParams.package;
    const isValid = car.packages.some((pkg) => pkg.id === fromQuery);

    return isValid && fromQuery ? fromQuery : (car.packages[0]?.id ?? "");
  }, [bookingParams.package, car.packages]);

  const [selectedPackageId, setSelectedPackageId] = useState(initialPackageId);
  const [guestCount, setGuestCount] = useState(bookingParams.guests);
  const [specialRequests, setSpecialRequests] = useState(
    bookingParams.specialRequests ?? "",
  );
  const days = bookingParams.days ?? 1;

  const handleProceedToPay = () => {
    guardProceed(() => {
      const params = serializeBookingParams({
        package: selectedPackageId,
        date: bookingParams.date,
        time: bookingParams.time,
        days,
        guests: guestCount,
        rooms: 1,
        specialRequests,
      });
      router.push(`/car-rentals/${car.id}/book/payment?${params.toString()}`);
    });
  };

  return (
    <div className="bg-[#F5F5F5]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mt-15 flex w-full flex-col justify-between gap-3 border-b border-[#CCCCCC] pb-5.5 md:flex-row md:items-center">
          <CarBookingBreadcrumbs carName={car.name} />
          <CarBookingStepper carId={car.id} currentStep={currentStep} />
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
              <CarBookingSummaryCard
                car={car}
                packages={car.packages}
                selectedPackageId={selectedPackageId}
                days={days}
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

export function CarBookingCheckoutPage(props: CarBookingCheckoutPageProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F5F5]" />}>
      <CarBookingCheckoutPageContent {...props} />
    </Suspense>
  );
}
