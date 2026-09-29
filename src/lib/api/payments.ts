import { apiFetch } from "@/lib/api/backend";

export type PaymentProvider = {
  provider: string;
  displayName: string;
  publicKey?: string;
  currencies: string[];
};

// GET /payments/providers — optional currency filter.
export async function getPaymentProviders(
  currency?: string,
  signal?: AbortSignal,
): Promise<PaymentProvider[]> {
  return apiFetch<PaymentProvider[]>("/payments/providers", {
    query: { currency },
    signal,
  });
}

// Currencies a Naira-priced booking can be charged in through Stripe.
export type ChargeCurrency = "USD" | "EUR" | "GBP";

export type FxQuote = {
  from: string;
  to: string;
  amount: number;
  // In `to`, rounded up to the cent. Indicative: the exact charge is
  // re-quoted when checkout starts (returned as `chargeAmount` by .../pay).
  convertedAmount: number;
  // Units of `to` per 1 unit of `from`.
  rate: number;
  // When the rate was published (ISO 8601).
  rateTimestamp: string;
};

// GET /payments/fx-quote — convert a booking total for display before paying.
// Fails with 503 when the backend has no exchange rate.
export async function getFxQuote(
  from: string,
  to: string,
  amount: number,
  signal?: AbortSignal,
): Promise<FxQuote> {
  return apiFetch<FxQuote>("/payments/fx-quote", {
    // The quote endpoint accepts at most 2 decimals.
    query: { from, to, amount: Math.round(amount * 100) / 100 },
    signal,
  });
}

// Body of POST /{cars,accommodations,experiences}/bookings/:id/pay.
export type InitBookingPaymentInput = {
  email?: string;
  phone?: string;
  callbackUrl?: string;
  // Omit to let the backend pick by currency (NGN -> Paystack, else Stripe).
  provider?: "PAYSTACK" | "STRIPE";
  // Charge in this currency instead of the booking's own (NGN booking paid in
  // USD through Stripe). Requires provider STRIPE (or omitted).
  chargeCurrency?: ChargeCurrency;
};

export type InitBookingPaymentResult = {
  authorizationUrl: string;
  reference: string;
  // Present only when the booking is charged in a converted currency.
  chargeCurrency?: string;
  chargeAmount?: number;
};
