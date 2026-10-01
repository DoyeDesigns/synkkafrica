"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import type { BookingStepId } from "@/features/travel/booking/constants";
import {
  bookingParamsToConfirmationInput,
  createBookingConfirmation,
} from "@/features/travel/booking/booking-confirmation";
import {
  bookAccommodation,
  initAccommodationPayment,
} from "@/lib/api/accommodations";
import {
  getDefaultCheckInDate,
  getDefaultCheckOutDate,
  parseBookingParams,
} from "@/features/travel/booking/booking-params";
import { BookingBreadcrumbs } from "@/features/travel/components/booking/booking-breadcrumbs";
import { BookingPaymentLoader } from "@/features/travel/components/booking/booking-payment-loader";
import {
  BookingPaymentMethods,
  payInputForMethod,
  redirectToCheckout,
  type CheckoutMethodId,
  type PayOptions,
} from "@/features/travel/components/booking/booking-payment-methods";
import {
  BookingPaymentBreakdown,
  toChargeBreakdown,
  type BookingChargeBreakdown,
} from "@/features/travel/components/booking/booking-payment-breakdown";
import { BookingStepper } from "@/features/travel/components/booking/booking-stepper";
import type { PropertyDetail } from "@/features/travel/data/property-booking";

type BookingPaymentPageProps = {
  property: PropertyDetail;
};

function BookingPaymentPageContent({ property }: BookingPaymentPageProps) {
  const searchParams = useSearchParams();
  const currentStep: BookingStepId = "payment";
  const query = searchParams.toString();
  // Effects can run twice (StrictMode); ensure the booking is created once.
  const submittedRef = useRef(false);

  // The backend's price breakdown for the booking it just created — the
  // authoritative amounts (subtotal + service fee = total) that get charged.
  const [booking, setBooking] = useState<BookingChargeBreakdown | null>(null);
  const [email, setEmail] = useState(
    () => parseBookingParams(searchParams).email ?? "",
  );
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState<false | CheckoutMethodId>(false);

  // Create the real booking request once (awaiting vendor confirmation). This
  // reserves it; payment is the next action.
  useEffect(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;

    const bookingParams = parseBookingParams(searchParams);
    const checkIn = bookingParams.checkIn ?? getDefaultCheckInDate();
    const checkOut = bookingParams.checkOut ?? getDefaultCheckOutDate(checkIn);
    const selectedRoom =
      property.rooms.find((room) => room.id === bookingParams.room) ??
      property.rooms[0];

    bookAccommodation(property.id, {
      roomId: selectedRoom?.id,
      checkIn,
      checkOut,
      guests: bookingParams.guests,
      roomCount: bookingParams.rooms,
      guestFirstName: bookingParams.guestFirstName,
      specialRequests: bookingParams.specialRequests,
    })
      .then((result) => {
        createBookingConfirmation({
          ...bookingParamsToConfirmationInput(bookingParams, {
            type: "accommodation",
            id: property.id,
            name: property.name,
            // The backend total (subtotal + service fee) is what's charged.
            total: result.total ?? result.amount,
            currency: result.currency,
          }),
          reference: result.bookingReference,
        });
        setBooking(toChargeBreakdown(result));
      })
      .catch(() => {
        submittedRef.current = false;
        setError("We couldn't reserve your booking. Please try again.");
      });
  }, [property, searchParams]);

  const handlePay = (method: CheckoutMethodId, options?: PayOptions) => {
    if (!booking || paying) return;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setError("Enter a valid email for your receipt.");
      return;
    }
    setError(null);
    setPaying(method);
    const { provider, chargeCurrency } = payInputForMethod(method, options);
    const callbackUrl = `${window.location.origin}/accommodations/${property.id}/book/confirmation?${query}&bookingId=${booking.bookingId}`;
    initAccommodationPayment(booking.bookingId, {
      email: email.trim(),
      phone: phone.trim() || undefined,
      callbackUrl,
      provider,
      chargeCurrency,
    })
      .then(({ authorizationUrl }) => redirectToCheckout(authorizationUrl))
      .catch(() => {
        setPaying(false);
        setError("We couldn't start the payment. Please try again.");
      });
  };

  return (
    <div className="bg-[#F5F5F5]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mt-15 flex w-full flex-col justify-between gap-3 border-b border-[#CCCCCC] pb-5.5 md:flex-row md:items-center">
          <BookingBreadcrumbs propertyName={property.name} />
          <BookingStepper propertyId={property.id} currentStep={currentStep} />
        </div>

        {!booking ? (
          error ? (
            <div className="mx-auto mt-10 max-w-md rounded-2xl border border-[#F1C7B8] bg-white p-6 text-center">
              <p className="text-sm font-medium font-satoshi text-[#C0392B]">
                {error}
              </p>
            </div>
          ) : (
            <BookingPaymentLoader />
          )
        ) : (
          <div className="mx-auto mt-10 max-w-md rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold font-satoshi text-[#2F2F2F]">
              Pay for your booking
            </h2>
            <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
              {property.name}
            </p>

            <BookingPaymentBreakdown breakdown={booking} />

            <label className="mt-4 block">
              <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
                Email for receipt
              </span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="mt-1.5 h-11 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none focus:border-[#135391]"
              />
            </label>

            <label className="mt-4 block">
              <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
                Phone (optional)
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+234 800 000 0000"
                className="mt-1.5 h-11 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none focus:border-[#135391]"
              />
            </label>

            {error ? (
              <p className="mt-3 text-xs font-medium font-satoshi text-[#C0392B]">
                {error}
              </p>
            ) : null}

            <div className="mt-5">
              <BookingPaymentMethods
                currency={booking.currency}
                convertibleTotal={booking.total}
                paying={paying}
                onPay={handlePay}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function BookingPaymentPage(props: BookingPaymentPageProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F5F5]" />}>
      <BookingPaymentPageContent {...props} />
    </Suspense>
  );
}
