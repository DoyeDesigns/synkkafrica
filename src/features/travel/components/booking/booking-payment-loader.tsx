"use client";

import { MoonLoader } from "react-spinners";

import { useTranslation } from "@/hooks/use-translation";

export function BookingPaymentLoader() {
  const t = useTranslation();

  return (
    <div className="mt-8 flex min-h-[420px] flex-col items-center justify-center gap-4 rounded-xl bg-white p-8 sm:min-h-[520px]">
      <MoonLoader color="#004785" size={56} speedMultiplier={0.8} />
      <p className="text-sm font-medium font-satoshi text-foreground/70">
        {t("booking.payment.processing")}
      </p>
    </div>
  );
}
