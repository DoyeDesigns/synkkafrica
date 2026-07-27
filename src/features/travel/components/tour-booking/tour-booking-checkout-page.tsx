"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import type { TourBookingStepId } from "@/features/travel/booking/tour-constants";
import { parseBookingParams, serializeBookingParams } from "@/features/travel/booking/booking-params";
import { GuestDetailsForm } from "@/features/travel/components/booking/guest-details-form";
import { TourBookingBreadcrumbs } from "@/features/travel/components/tour-booking/tour-booking-breadcrumbs";
import { TourBookingStepper } from "@/features/travel/components/tour-booking/tour-booking-stepper";
import { TourBookingSummaryCard } from "@/features/travel/components/tour-booking/tour-booking-summary-card";
import type { TourDetail } from "@/features/travel/data/tour-booking";
import { useGuestCheckoutGate } from "@/features/travel/hooks/use-guest-checkout-gate";
import { useTranslation } from "@/hooks/use-translation";

type TourBookingCheckoutPageProps = {
  tour: TourDetail;
};

function TourBookingCheckoutPageContent({ tour }: TourBookingCheckoutPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslation();
  const currentStep: TourBookingStepId = "checkout";
  const bookingParams = parseBookingParams(searchParams);
  const { identity, setIdentity, identityErrors, guardProceed } =
    useGuestCheckoutGate();

  const initialOptionId = useMemo(() => {
    const fromQuery = bookingParams.option;
    const isValid = tour.options.some((option) => option.id === fromQuery);

    return isValid && fromQuery ? fromQuery : (tour.options[0]?.id ?? "");
  }, [bookingParams.option, tour.options]);

  const [selectedOptionId, setSelectedOptionId] = useState(initialOptionId);
  const [guestCount, setGuestCount] = useState(bookingParams.guests);
  const [specialRequests, setSpecialRequests] = useState(
    bookingParams.specialRequests ?? "",
  );
  const days = bookingParams.days ?? 1;

  const handleProceedToPay = () => {
    guardProceed(() => {
      const params = serializeBookingParams({
        option: selectedOptionId,
        date: bookingParams.date,
        time: bookingParams.time,
        guests: guestCount,
        days,
        rooms: 1,
        specialRequests,
      });
      router.push(`/tours/${tour.id}/book/payment?${params.toString()}`);
    });
  };

  return (
    <div className="bg-[#F5F5F5]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mt-15 flex w-full flex-col justify-between gap-3 border-b border-[#CCCCCC] pb-5.5 md:flex-row md:items-center">
          <TourBookingBreadcrumbs tourTitle={tour.title} />
          <TourBookingStepper tourId={tour.id} currentStep={currentStep} />
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
              <TourBookingSummaryCard
                tour={tour}
                options={tour.options}
                selectedOptionId={selectedOptionId}
                guestCount={guestCount}
                days={days}
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

export function TourBookingCheckoutPage(props: TourBookingCheckoutPageProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F5F5]" />}>
      <TourBookingCheckoutPageContent {...props} />
    </Suspense>
  );
}
