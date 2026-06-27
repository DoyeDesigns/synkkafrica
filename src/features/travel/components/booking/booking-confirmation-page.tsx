"use client";

import { useEffect, useState } from "react";

import type { BookingStepId } from "@/features/travel/booking/constants";
import { BookingBreadcrumbs } from "@/features/travel/components/booking/booking-breadcrumbs";
import { BookingStepper } from "@/features/travel/components/booking/booking-stepper";
import { useTranslation } from "@/hooks/use-translation";
import Image from "next/image";
import type { PropertyDetail } from "@/features/travel/data/property-booking";

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

        <div className="mt-16 flex flex-col items-center pb-16">
          <div className="w-full max-w-xl rounded-xl bg-white px-8 py-14 text-center sm:px-12 sm:py-16">
            <div className="mx-auto flex items-center justify-center">
              {/* <Send
                className="h-16 w-16 -rotate-12 fill-[#F2C94C] text-[#E2B93B]"
                strokeWidth={1.25}
              /> */}
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
