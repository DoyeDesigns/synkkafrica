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
