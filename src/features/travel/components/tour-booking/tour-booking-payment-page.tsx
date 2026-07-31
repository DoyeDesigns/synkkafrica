"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import type { TourBookingStepId } from "@/features/travel/booking/tour-constants";
import { createBookingConfirmation } from "@/features/travel/booking/booking-confirmation";
import { parseBookingParams } from "@/features/travel/booking/booking-params";
import { BookingPaymentLoader } from "@/features/travel/components/booking/booking-payment-loader";
import { TourBookingBreadcrumbs } from "@/features/travel/components/tour-booking/tour-booking-breadcrumbs";
import { TourBookingStepper } from "@/features/travel/components/tour-booking/tour-booking-stepper";
import type { TourDetail } from "@/features/travel/data/tour-booking";
import {
  bookExperience,
  initExperiencePayment,
} from "@/lib/api/experiences";

type TourBookingPaymentPageProps = {
  tour: TourDetail;
};

function TourBookingPaymentPageContent({ tour }: TourBookingPaymentPageProps) {
  const searchParams = useSearchParams();
  const currentStep: TourBookingStepId = "payment";
  const query = searchParams.toString();
  const submittedRef = useRef(false);

  const [booking, setBooking] = useState<{
    bookingId: string;
    amount: number;
    currency: string;
  } | null>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;

    const p = parseBookingParams(searchParams);
    const date = p.date ?? new Date().toISOString().slice(0, 10);

    bookExperience(tour.id, {
      optionId: p.option,
      date,
      time: p.time,
      guests: p.guests,
    })
      .then((result) => {
        createBookingConfirmation({
          productType: "tour",
          productId: tour.id,
          productName: tour.title,
          guests: p.guests,
          total: result.amount,
          currency: result.currency,
          reference: result.bookingReference,
        });
        setBooking({
          bookingId: result.bookingId,
          amount: result.amount,
          currency: result.currency,
        });
      })
      .catch(() => {
        submittedRef.current = false;
        setError("We couldn't reserve your booking. Please try again.");
      });
  }, [tour, searchParams]);

  const handlePay = () => {
    if (!booking || paying) return;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setError("Enter a valid email for your receipt.");
      return;
    }
    setError(null);
    setPaying(true);
    const callbackUrl = `${window.location.origin}/tours/${tour.id}/book/confirmation?${query}&bookingId=${booking.bookingId}`;
    initExperiencePayment(booking.bookingId, { email: email.trim(), callbackUrl })
      .then(({ authorizationUrl }) => {
        window.location.href = authorizationUrl;
      })
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

            <div className="mt-4 flex items-center justify-between rounded-lg bg-[#F8F8F8] px-4 py-3">
              <span className="text-sm font-medium font-satoshi text-[#676565]">
                Total
              </span>
              <span className="text-lg font-bold font-satoshi text-[#D85A30]">
                {booking.currency} {booking.amount.toLocaleString()}
              </span>
            </div>

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

            {error ? (
              <p className="mt-3 text-xs font-medium font-satoshi text-[#C0392B]">
                {error}
              </p>
            ) : null}

            <button
              type="button"
              onClick={handlePay}
              disabled={paying}
              className="mt-5 h-11 w-full rounded-lg bg-[#D85A30] text-sm font-bold font-satoshi text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {paying ? "Redirecting…" : "Pay with Paystack"}
            </button>
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
