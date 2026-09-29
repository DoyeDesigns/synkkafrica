"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Info } from "lucide-react";

import { useTranslation } from "@/hooks/use-translation";
import { getPaymentProviders } from "@/lib/api/payments";

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

// Send the browser to the provider's hosted checkout. Only absolute http(s)
// URLs are followed — anything else (javascript:, data:, a relative path) is
// treated as a failed init so a bad backend response can't navigate us
// somewhere unsafe.
export function redirectToCheckout(authorizationUrl: string): void {
  let url: URL;
  try {
    url = new URL(authorizationUrl);
  } catch {
    throw new Error("Invalid checkout URL");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Invalid checkout URL");
  }
  window.location.href = url.toString();
}

// Checkout gateways the vendor-booking flow can use. The backend's provider
// list also includes Flutterwave, which marketplace checkout doesn't wire up.
const CHECKOUT_GATEWAYS: readonly CheckoutGateway[] = ["PAYSTACK", "STRIPE"];

// Used only when GET /payments/providers can't be reached — mirrors the
// backend default (NGN -> Paystack, USD/EUR/GBP -> Stripe).
function fallbackGateways(currency: string): CheckoutGateway[] {
  return currency.toUpperCase() === "NGN" ? ["PAYSTACK"] : ["STRIPE"];
}

// Gateways that accept `currency` under the live backend config.
// With no currency every checkout gateway is offered (legacy callers).
export function useSupportedGateways(currency?: string) {
  const code = currency?.toUpperCase() ?? "";
  const query = useQuery({
    queryKey: ["payment-providers", code],
    queryFn: ({ signal }) => getPaymentProviders(code, signal),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: Boolean(code),
  });
  const gateways: CheckoutGateway[] = !code
    ? [...CHECKOUT_GATEWAYS]
    : query.data
    ? CHECKOUT_GATEWAYS.filter((gateway) =>
        query.data.some(
          (p) =>
            p.provider === gateway &&
            p.currencies.map((c) => c.toUpperCase()).includes(code),
        ),
      )
    : query.isError
      ? fallbackGateways(code)
      : [];
  return { gateways, isLoading: Boolean(code) && query.isLoading };
}

type BookingPaymentMethodsProps = {
  // The booking's charge currency — only methods whose gateway supports it
  // are offered (Stripe can't charge NGN; Paystack only takes NGN/USD).
  // Omit to show every method.
  currency?: string;
  paying: false | CheckoutMethodId;
  disabled?: boolean;
  onPay: (method: CheckoutMethodId) => void;
};

export function BookingPaymentMethods({
  currency,
  paying,
  disabled = false,
  onPay,
}: BookingPaymentMethodsProps) {
  const t = useTranslation();
  const { gateways, isLoading } = useSupportedGateways(currency);
  const busy = paying !== false || disabled;
  const methods = METHODS.filter((method) => gateways.includes(method.gateway));

  if (isLoading) {
    return (
      <p className="text-xs font-medium font-satoshi text-[#676565]">
        {t("booking.payment.loadingMethods")}
      </p>
    );
  }

  if (methods.length === 0) {
    return (
      <div className="flex gap-2 rounded-lg bg-[#FDF2EE] px-3 py-2.5">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#C0392B]" />
        <p className="text-xs font-medium leading-5 font-satoshi text-[#2F2F2F]">
          {t("booking.payment.noMethodsForCurrency", { currency: currency?.toUpperCase() ?? "" })}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {gateways.length > 1 ? (
        <div className="flex gap-2 rounded-lg bg-[#F4F8FC] px-3 py-2.5">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#135391]" />
          <p className="text-xs font-medium leading-5 font-satoshi text-[#2F2F2F]">
            {t("booking.payment.audienceHint")}
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {methods.map((method) => {
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
