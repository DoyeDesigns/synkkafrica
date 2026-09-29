"use client";

import Image from "next/image";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Info } from "lucide-react";

import { useTranslation } from "@/hooks/use-translation";
import {
  getFxQuote,
  getPaymentProviders,
  type ChargeCurrency,
} from "@/lib/api/payments";
import { formatMoney } from "@/lib/format-money";
import { usePreferencesStore } from "@/stores/preferences-store";

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

export type PayOptions = {
  // Set when the customer chose to pay a Naira booking in another currency;
  // send it as `chargeCurrency` to .../pay (the provider is then Stripe).
  chargeCurrency?: ChargeCurrency;
};

// What .../pay needs for a chosen method: the gateway, plus the currency to
// convert into when the customer picked "Pay in US dollars".
export function payInputForMethod(
  method: CheckoutMethodId,
  options?: PayOptions,
): { provider: CheckoutGateway; chargeCurrency?: ChargeCurrency } {
  const provider = gatewayForMethod(method);
  return provider === "STRIPE" && options?.chargeCurrency
    ? { provider, chargeCurrency: options.chargeCurrency }
    : { provider };
}

type BookingPaymentMethodsProps = {
  // The booking's charge currency — only methods whose gateway supports it
  // are offered (Stripe can't charge NGN; Paystack only takes NGN/USD).
  // Omit to show every method.
  currency?: string;
  // The booking total in `currency`. When given for an NGN booking, the
  // customer can also pay in US dollars through Stripe: the total is
  // converted at checkout (see GET /payments/fx-quote) and `onPay` receives
  // `{ chargeCurrency: "USD" }`. Only vendor bookings (cars, stays,
  // experiences) support this.
  convertibleTotal?: number;
  paying: false | CheckoutMethodId;
  disabled?: boolean;
  onPay: (method: CheckoutMethodId, options?: PayOptions) => void;
};

export function BookingPaymentMethods(props: BookingPaymentMethodsProps) {
  const { currency, convertibleTotal } = props;
  if (
    currency?.toUpperCase() === "NGN" &&
    typeof convertibleTotal === "number" &&
    convertibleTotal > 0
  ) {
    return <NairaOrDollarMethods {...props} total={convertibleTotal} />;
  }
  return <SingleCurrencyMethods {...props} />;
}

function SingleCurrencyMethods({
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

      <MethodButtons
        methods={methods}
        paying={paying}
        busy={busy}
        onPick={(id) => onPay(id)}
      />
    </div>
  );
}

type CheckoutMethod = (typeof METHODS)[number];

function MethodButtons({
  methods,
  paying,
  busy,
  onPick,
}: {
  methods: CheckoutMethod[];
  paying: false | CheckoutMethodId;
  busy: boolean;
  onPick: (id: CheckoutMethodId) => void;
}) {
  const t = useTranslation();
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
      {methods.map((method) => {
        const isPaying = paying === method.id;
        const showWordmarkOnly = method.id === "paystack";

        return (
          <button
            key={method.id}
            type="button"
            onClick={() => onPick(method.id)}
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
  );
}

type PayCurrencyGroup = "NGN" | "USD";

// NGN booking: "Pay in Naira" (Paystack) or "Pay in US dollars" (Stripe —
// Apple Pay / Google Pay / PayPal, which only take USD/EUR/GBP here). The
// dollar amount shown is an indicative quote; the backend re-quotes when the
// checkout starts and Stripe shows the exact amount.
function NairaOrDollarMethods({
  paying,
  disabled = false,
  onPay,
  total,
}: BookingPaymentMethodsProps & { total: number }) {
  const t = useTranslation();
  const displayCurrency = usePreferencesStore((state) => state.currency);
  const naira = useSupportedGateways("NGN");
  const dollars = useSupportedGateways("USD");
  const quote = useQuery({
    queryKey: ["fx-quote", "NGN", "USD", total],
    queryFn: ({ signal }) => getFxQuote("NGN", "USD", total, signal),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
  const [picked, setPicked] = useState<PayCurrencyGroup | null>(null);
  const busy = paying !== false || disabled;

  const nairaMethods = METHODS.filter(
    (method) =>
      method.gateway === "PAYSTACK" && naira.gateways.includes("PAYSTACK"),
  );
  const dollarMethods = METHODS.filter(
    (method) =>
      method.gateway === "STRIPE" && dollars.gateways.includes("STRIPE"),
  );
  const dollarsAvailable = dollarMethods.length > 0 && !quote.isError;
  const nairaAvailable = nairaMethods.length > 0;

  if (naira.isLoading || dollars.isLoading) {
    return (
      <p className="text-xs font-medium font-satoshi text-[#676565]">
        {t("booking.payment.loadingMethods")}
      </p>
    );
  }

  if (!nairaAvailable && !dollarsAvailable) {
    return (
      <div className="flex gap-2 rounded-lg bg-[#FDF2EE] px-3 py-2.5">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#C0392B]" />
        <p className="text-xs font-medium leading-5 font-satoshi text-[#2F2F2F]">
          {t("booking.payment.noMethodsForCurrency", { currency: "NGN" })}
        </p>
      </div>
    );
  }

  // Default: dollars for visitors whose display currency (set from their
  // detected country, or chosen by them) isn't the Naira; Naira otherwise.
  const preferred: PayCurrencyGroup =
    picked ?? (displayCurrency === "NGN" ? "NGN" : "USD");
  const group: PayCurrencyGroup = !dollarsAvailable
    ? "NGN"
    : !nairaAvailable
      ? "USD"
      : preferred;

  const rateTime = quote.data
    ? new Date(quote.data.rateTimestamp).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "";

  const options: {
    id: PayCurrencyGroup;
    label: string;
    detail: string;
  }[] = [
    ...(nairaAvailable
      ? [
          {
            id: "NGN" as const,
            label: t("booking.payment.payInNaira"),
            detail: t("booking.payment.payInNairaHint", {
              amount: formatMoney("NGN", total),
            }),
          },
        ]
      : []),
    ...(dollarsAvailable
      ? [
          {
            id: "USD" as const,
            label: t("booking.payment.payInUsd"),
            detail: quote.data
              ? t("booking.payment.usdQuote", {
                  amount: formatMoney("USD", quote.data.convertedAmount),
                })
              : t("booking.payment.usdQuoteLoading"),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-3">
      <fieldset>
        <legend className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
          {t("booking.payment.currencyChoice")}
        </legend>
        <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {options.map((option) => {
            const selected = group === option.id;
            return (
              <label
                key={option.id}
                className={`flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2.5 font-satoshi transition-colors ${
                  selected
                    ? "border-[#135391] bg-[#F4F8FC]"
                    : "border-[#E5E5E5] bg-white hover:border-[#135391]"
                }`}
              >
                <input
                  type="radio"
                  name="pay-currency"
                  value={option.id}
                  checked={selected}
                  disabled={busy}
                  onChange={() => setPicked(option.id)}
                  className="mt-0.5 h-4 w-4 accent-[#135391]"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-[#2F2F2F]">
                    {option.label}
                  </span>
                  <span className="block text-xs font-medium text-[#676565]">
                    {option.detail}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {quote.isError && dollarMethods.length > 0 ? (
        <p className="text-xs font-medium font-satoshi text-[#676565]">
          {t("booking.payment.usdUnavailable")}
        </p>
      ) : null}

      {group === "USD" ? (
        <>
          {quote.data ? (
            <div className="flex gap-2 rounded-lg bg-[#F4F8FC] px-3 py-2.5">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#135391]" />
              <p className="text-xs font-medium leading-5 font-satoshi text-[#2F2F2F]">
                <span className="font-bold">
                  {t("booking.payment.usdQuote", {
                    amount: formatMoney("USD", quote.data.convertedAmount),
                  })}
                </span>{" "}
                {t("booking.payment.usdQuoteNote", { time: rateTime })}
              </p>
            </div>
          ) : null}
          <MethodButtons
            methods={dollarMethods}
            paying={paying}
            // Wait for the quote so the customer sees the dollar amount first.
            busy={busy || !quote.data}
            onPick={(id) => onPay(id, { chargeCurrency: "USD" })}
          />
        </>
      ) : (
        <MethodButtons
          methods={nairaMethods}
          paying={paying}
          busy={busy}
          onPick={(id) => onPay(id)}
        />
      )}
    </div>
  );
}
