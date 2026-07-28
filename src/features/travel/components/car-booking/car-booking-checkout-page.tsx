"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { CarRentalOptionsSection } from "@/features/travel/components/car-booking/car-rental-options-section";
import type { CarRentalMode } from "@/features/travel/booking/booking-params";
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

  const initialPackageId = useMemo(() => {
    const fromQuery = bookingParams.package;
    const isValid = car.packages.some((pkg) => pkg.id === fromQuery);

    return isValid && fromQuery ? fromQuery : (car.packages[0]?.id ?? "");
  }, [bookingParams.package, car.packages]);

  const [selectedPackageId, setSelectedPackageId] = useState(initialPackageId);
  const [guestCount, setGuestCount] = useState(bookingParams.guests);
  const [carRentalMode, setCarRentalMode] = useState<CarRentalMode>(
    bookingParams.carRentalMode ?? "self_drive",
  );
  const [requestDelivery, setRequestDelivery] = useState(
    bookingParams.requestDelivery ?? false,
  );
  const [deliveryAddress, setDeliveryAddress] = useState(
    bookingParams.deliveryAddress ?? "",
  );
  const [customerPickupAddress, setCustomerPickupAddress] = useState(
    bookingParams.customerPickupAddress ?? "",
  );
  const {
    identities,
    setIdentityAt,
    identityErrors,
    hasIdentityErrors,
    guardProceed,
  } = useGuestCheckoutGate(guestCount);
  const days = bookingParams.days ?? 1;

  const handleRentalModeChange = (mode: CarRentalMode) => {
    setCarRentalMode(mode);
    if (mode === "with_driver") {
      setRequestDelivery(false);
      setDeliveryAddress("");
    } else {
      setCustomerPickupAddress("");
    }
  };

  const handleProceedToPay = () => {
    guardProceed(() => {
      const params = serializeBookingParams({
        package: selectedPackageId,
        date: bookingParams.date,
        time: bookingParams.time,
        days,
        guests: guestCount,
        rooms: 1,
        carRentalMode,
        requestDelivery: carRentalMode === "self_drive" ? requestDelivery : undefined,
        deliveryAddress:
          carRentalMode === "self_drive" && requestDelivery
            ? deliveryAddress.trim() || undefined
            : undefined,
        customerPickupAddress:
          carRentalMode === "with_driver"
            ? customerPickupAddress.trim() || undefined
            : undefined,
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
          <div className="space-y-4">
            <CarRentalOptionsSection
              rentalMode={carRentalMode}
              onRentalModeChange={handleRentalModeChange}
              requestDelivery={requestDelivery}
              onRequestDeliveryChange={setRequestDelivery}
              deliveryAddress={deliveryAddress}
              onDeliveryAddressChange={setDeliveryAddress}
              customerPickupAddress={customerPickupAddress}
              onCustomerPickupAddressChange={setCustomerPickupAddress}
              pickupAddress={car.pickupAddress}
              driverAddonPrice={car.driverAddonPrice}
              deliveryFee={car.deliveryFee}
              currency={car.currency}
            />

            <GuestDetailsForm
              guestCount={guestCount}
              onGuestCountChange={setGuestCount}
              identities={identities}
              onIdentityChange={setIdentityAt}
              identityErrors={identityErrors}
              hideSpecialRequests
            />
          </div>

          <div>
            <div className="xl:sticky xl:top-10">
              {hasIdentityErrors ? (
                <p className="mb-3 rounded-md bg-[#FFF1EA] px-4 py-3 text-sm font-medium font-inter text-[#D85A30]">
                  {t("booking.guest.idValidationRequired")}
                </p>
              ) : null}
              <CarBookingSummaryCard
                car={car}
                packages={car.packages}
                selectedPackageId={selectedPackageId}
                days={days}
                carRentalMode={carRentalMode}
                requestDelivery={requestDelivery}
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
