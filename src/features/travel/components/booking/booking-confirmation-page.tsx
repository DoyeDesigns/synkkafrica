"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import type { BookingStepId } from "@/features/travel/booking/constants";
import {
  createBookingConfirmation,
  getStoredBookingConfirmation,
  type StoredBookingConfirmation,
} from "@/features/travel/booking/booking-confirmation";
import { BookingBreadcrumbs } from "@/features/travel/components/booking/booking-breadcrumbs";
import { BookingConfirmationDetails } from "@/features/travel/components/booking/booking-confirmation-details";
import { BookingStepper } from "@/features/travel/components/booking/booking-stepper";
import { useTranslation } from "@/hooks/use-translation";
import type { PropertyDetail } from "@/features/travel/data/property-booking";
import { getAccommodationPaymentStatus } from "@/lib/api/accommodations";
import { LeaveReviewForm } from "@/features/travel/components/booking/leave-review-form";

type PaymentState = "checking" | "paid" | "pending" | "none";

type BookingConfirmationPageProps = {
  property: PropertyDetail;
};

const RELOAD_SECONDS = 20;

function formatCountdown(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function BookingConfirmationPage({ property }: BookingConfirmationPageProps) {
  const t = useTranslation();
  const currentStep: BookingStepId = "confirmation";
  const [secondsLeft, setSecondsLeft] = useState(RELOAD_SECONDS);
  const [confirmation, setConfirmation] = useState<StoredBookingConfirmation | null>(
    null,
  );
  const [payment, setPayment] = useState<PaymentState>("none");

  useEffect(() => {
    const stored = getStoredBookingConfirmation();

    if (stored) {
      setConfirmation(stored);
      return;
    }

    setConfirmation(
      createBookingConfirmation({
        productType: "accommodation",
        productId: property.id,
        productName: property.name,
        guests: 2,
      }),
    );
  }, [property.id, property.name]);

  // Verify payment on return from Paystack. The payment page appends
  // `bookingId` to the callback URL; verify + reflect the real status.
  useEffect(() => {
    const bookingId = new URLSearchParams(window.location.search).get(
      "bookingId",
    );
    if (!bookingId) return;
    let cancelled = false;
    getAccommodationPaymentStatus(bookingId)
      .then((res) => {
        if (!cancelled) setPayment(res.paymentSecured ? "paid" : "pending");
      })
      .catch(() => {
        if (!cancelled) setPayment("pending");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) {
      window.location.reload();
      return;
    }

    const timeout = window.setTimeout(() => {
      setSecondsLeft((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timeout);
  }, [secondsLeft]);

  return (
    <div className="bg-[#F5F5F5]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mt-15 flex w-full flex-col justify-between gap-3 border-b border-[#CCCCCC] pb-5.5 md:flex-row md:items-center">
          <BookingBreadcrumbs propertyName={property.name} />
          <BookingStepper propertyId={property.id} currentStep={currentStep} />
        </div>

        {payment !== "none" ? (
          <div
            className={`mt-6 rounded-lg px-4 py-3 text-center text-sm font-semibold font-satoshi ${
              payment === "paid"
                ? "bg-[#E7F6EC] text-[#2E7D32]"
                : payment === "checking"
                  ? "bg-[#F1F5F9] text-[#475569]"
                  : "bg-[#FDF3EF] text-[#C0392B]"
            }`}
          >
            {payment === "paid"
              ? "Payment received — your booking is awaiting the host's confirmation."
              : payment === "checking"
                ? "Confirming your payment…"
                : "We haven't received your payment yet. If you were charged, it may take a moment to reflect."}
          </div>
        ) : null}

        <div className="mt-16 flex flex-col items-center pb-16">
          <div className="w-full max-w-xl rounded-xl bg-white px-8 py-14 text-center sm:px-12 sm:py-16">
            <div className="mx-auto flex items-center justify-center">
              <Image
                src="/successful.png"
                alt={t("booking.confirmation.imageAlt")}
                width={177}
                height={108}
              />
            </div>

            <h2 className="mt-6 text-2xl font-bold font-montserrat text-[#D85A30] sm:text-[28px]">
              {t("booking.confirmation.title")}
            </h2>

            <p className="mx-auto mt-4 max-w-md text-sm font-normal font-inter text-foreground sm:text-base">
              {t("booking.confirmation.subtitle")}
            </p>
          </div>

          {confirmation ? <BookingConfirmationDetails confirmation={confirmation} /> : null}

          {payment === "paid" ? (
            <LeaveReviewForm listingId={property.id} />
          ) : null}

          <p className="mt-8 text-sm font-medium font-inter text-foreground">
            {t("booking.confirmation.reloadIn")}{" "}
            <span className="font-semibold text-[#D85A30]">
              {formatCountdown(secondsLeft)}
            </span>
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-3 text-sm font-medium font-inter text-[#D85A30] underline underline-offset-2 transition-opacity hover:opacity-80"
          >
            {t("booking.confirmation.reloadNow")}
          </button>
        </div>
      </div>
    </div>
  );
}
