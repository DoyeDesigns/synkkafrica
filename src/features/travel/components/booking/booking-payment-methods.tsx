"use client";

import Image from "next/image";
import { Info } from "lucide-react";

import { useTranslation } from "@/hooks/use-translation";

export type CheckoutGateway = "PAYSTACK" | "STRIPE";
export type CheckoutMethodId =
  | "apple-pay"
  | "google-pay"
  | "paypal"
  | "paystack";

const METHODS: {
  id: CheckoutMethodId;
  gateway: CheckoutGateway;
  labelKey:
    | "booking.payment.applePay"
    | "booking.payment.googlePay"
    | "booking.payment.paypal"
    | "booking.payment.paystack";
  logo: string;
  logoWidth: number;
  logoHeight: number;
}[] = [
  {
    id: "apple-pay",
    gateway: "STRIPE",
    labelKey: "booking.payment.applePay",
    logo: "/apple.png",
    logoWidth: 18,
    logoHeight: 18,
  },
  {
    id: "google-pay",
    gateway: "STRIPE",
    labelKey: "booking.payment.googlePay",
    logo: "/google.png",
    logoWidth: 18,
    logoHeight: 18,
  },
  {
    id: "paypal",
    gateway: "STRIPE",
    labelKey: "booking.payment.paypal",
    logo: "/paypal.svg",
    logoWidth: 22,
    logoHeight: 22,
  },
  {
    id: "paystack",
    gateway: "PAYSTACK",
    labelKey: "booking.payment.paystack",
    logo: "/paystack.png",
    logoWidth: 88,
    logoHeight: 22,
  },
];

export function gatewayForMethod(id: CheckoutMethodId): CheckoutGateway {
  return id === "paystack" ? "PAYSTACK" : "STRIPE";
}

type BookingPaymentMethodsProps = {
  paying: false | CheckoutMethodId;
  disabled?: boolean;
  onPay: (method: CheckoutMethodId) => void;
};

export function BookingPaymentMethods({
  paying,
  disabled = false,
  onPay,
}: BookingPaymentMethodsProps) {
  const t = useTranslation();
  const busy = paying !== false || disabled;

  return (
    <div className="space-y-3">
      <div className="flex gap-2 rounded-lg bg-[#F4F8FC] px-3 py-2.5">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#135391]" />
        <p className="text-xs font-medium leading-5 font-satoshi text-[#2F2F2F]">
          {t("booking.payment.audienceHint")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {METHODS.map((method) => {
          const isPaying = paying === method.id;
          const showWordmarkOnly = method.id === "paystack";

          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onPay(method.id)}
              disabled={busy}
              className="flex h-12 items-center justify-center gap-2 rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm font-bold font-satoshi text-[#2F2F2F] transition-colors hover:border-[#135391] hover:bg-[#F8FBFE] disabled:opacity-60"
            >
              <Image
                src={method.logo}
                alt=""
                width={method.logoWidth}
                height={method.logoHeight}
                unoptimized={method.logo.endsWith(".svg")}
                className={
                  showWordmarkOnly
                    ? "h-5 w-auto object-contain"
                    : "h-4.5 w-4.5 object-contain"
                }
              />
              {showWordmarkOnly ? (
                <span className="sr-only">{t(method.labelKey)}</span>
              ) : (
                <span>{isPaying ? t("booking.payment.redirecting") : t(method.labelKey)}</span>
              )}
              {showWordmarkOnly && isPaying ? (
                <span className="text-xs font-medium text-[#676565]">
                  {t("booking.payment.redirecting")}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
