"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import type { TourBookingStepId } from "@/features/travel/booking/tour-constants";
import { createBookingConfirmation } from "@/features/travel/booking/booking-confirmation";
import { parseBookingParams } from "@/features/travel/booking/booking-params";
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
import { TourBookingBreadcrumbs } from "@/features/travel/components/tour-booking/tour-booking-breadcrumbs";
import { TourBookingStepper } from "@/features/travel/components/tour-booking/tour-booking-stepper";
import type { TourDetail } from "@/features/travel/data/tour-booking";
import {
  bookExperience,
  initExperiencePayment,
} from "@/lib/api/experiences";
import { ApiError } from "@/lib/api/backend";

type TourBookingPaymentPageProps = {
  tour: TourDetail;
};

function TourBookingPaymentPageContent({ tour }: TourBookingPaymentPageProps) {
  const searchParams = useSearchParams();
  const currentStep: TourBookingStepId = "payment";
  const query = searchParams.toString();
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

  useEffect(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;

    const p = parseBookingParams(searchParams);
    const date = p.date ?? new Date().toISOString().slice(0, 10);

    bookExperience(tour.id, {
      optionId: p.option,
      date,
      // Only send a time when one was chosen (vendors without slots take none).
      ...(p.time ? { time: p.time } : {}),
      guests: p.guests,
      guestFirstName: p.guestFirstName,
      specialRequests: p.specialRequests,
    })
      .then((result) => {
        createBookingConfirmation({
          productType: "tour",
          productId: tour.id,
          productName: tour.title,
          guests: p.guests,
          total: result.total ?? result.amount,
          currency: result.currency,
          reference: result.bookingReference,
        });
        setBooking(toChargeBreakdown(result));
      })
      .catch((err: unknown) => {
        submittedRef.current = false;
        // A 400 carries the backend's human-readable reason (guest limits,
        // non-operating date, invalid time slot) — show it as-is.
        setError(
          err instanceof ApiError && err.status === 400 && err.message
            ? err.message
            : "We couldn't reserve your booking. Please try again.",
        );
      });
  }, [tour, searchParams]);

  const handlePay = (method: CheckoutMethodId, options?: PayOptions) => {
    if (!booking || paying !== false) return;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setError("Enter a valid email for your receipt.");
      return;
    }
    setError(null);
    setPaying(method);
    const { provider, chargeCurrency } = payInputForMethod(method, options);
    const callbackUrl = `${window.location.origin}/tours/${tour.id}/book/confirmation?${query}&bookingId=${booking.bookingId}`;
    initExperiencePayment(booking.bookingId, {
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
          <TourBookingBreadcrumbs tourTitle={tour.title} />
          <TourBookingStepper tourId={tour.id} currentStep={currentStep} />
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
              Pay for your experience
            </h2>
            <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
              {tour.title}
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

export function TourBookingPaymentPage(props: TourBookingPaymentPageProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F5F5]" />}>
      <TourBookingPaymentPageContent {...props} />
    </Suspense>
  );
}
