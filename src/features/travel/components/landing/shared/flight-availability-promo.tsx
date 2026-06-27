"use client";

import Link from "next/link";

import { useTranslation } from "@/hooks/use-translation";

export function FlightAvailabilityPromo() {
  const t = useTranslation();

  return (
    <div className="flex h-[275px] flex-col items-end justify-end rounded-[10px] bg-[url('/flight-availability.png')] bg-cover bg-center bg-no-repeat">
      <div className="flex w-full items-center justify-between bg-black/10 py-10 backdrop-blur-[9px] rounded-b-[10px]">
        <p className="ml-12 max-w-[350px] text-lg font-semibold font-montserrat text-white sm:text-[22px]">
          {t("landing.flightPromo.headline")}
        </p>
        <Link
          href="/?section=flights&view=results"
          className="mr-15 rounded-[5px] bg-white px-6 py-2.5 text-sm font-bold font-montserrat text-[#D85A30]"
        >
          {t("landing.flightPromo.cta")}
        </Link>
      </div>
    </div>
  );
}
