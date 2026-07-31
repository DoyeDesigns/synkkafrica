"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import type { CarBookingStepId } from "@/features/travel/booking/car-constants";
import { CarBookingBreadcrumbs } from "@/features/travel/components/car-booking/car-booking-breadcrumbs";
import { CarBookingStepper } from "@/features/travel/components/car-booking/car-booking-stepper";
import { useTranslation } from "@/hooks/use-translation";
import type { CarDetail } from "@/features/travel/data/car-booking";
import { getCarPaymentStatus } from "@/lib/api/cars";

type CarBookingConfirmationPageProps = {
  car: CarDetail;
};

type PaymentState = "checking" | "paid" | "pending" | "none";

const RELOAD_SECONDS = 20;

function formatCountdown(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function CarBookingConfirmationPage({ car }: CarBookingConfirmationPageProps) {
  const t = useTranslation();
  const currentStep: CarBookingStepId = "confirmation";
  const [secondsLeft, setSecondsLeft] = useState(RELOAD_SECONDS);
  const [payment, setPayment] = useState<PaymentState>("none");

  // Verify payment on return from Paystack (bookingId is on the callback URL).
  useEffect(() => {
    const bookingId = new URLSearchParams(window.location.search).get(
      "bookingId",
    );
    if (!bookingId) return;
    let cancelled = false;
    getCarPaymentStatus(bookingId)
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
          <CarBookingBreadcrumbs carName={car.name} />
          <CarBookingStepper carId={car.id} currentStep={currentStep} />
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
              ? "Payment received — your rental is awaiting the host's confirmation."
              : payment === "checking"
                ? "Confirming your payment…"
                : "We haven't received your payment yet. If you were charged, it may take a moment to reflect."}
          </div>
        ) : null}

        <div className="mt-16 flex flex-col items-center pb-16">
          <div className="w-full max-w-xl rounded-xl bg-white px-8 py-14 text-center shadow-sm sm:px-12 sm:py-16">
            <div className="mx-auto flex h-20 w-20 items-center justify-center">
              <Image
                src="/successful.png"
                alt=""
                width={80}
                height={80}
                className="h-20 w-20 object-contain"
              />
            </div>

            <h2 className="mt-6 text-2xl font-bold font-montserrat text-[#D85A30] sm:text-[28px]">
              {t("booking.confirmation.title")}
            </h2>

            <p className="mx-auto mt-4 max-w-md text-sm font-normal font-inter text-foreground sm:text-base">
              {t("booking.confirmation.subtitle")}
            </p>
          </div>

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
