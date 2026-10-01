import {
  FALLBACK_USD_RATES,
  isCurrencyCode,
} from "@/lib/preferences/currencies";
import type { CurrencyCode } from "@/lib/preferences/types";

export type FxRatesSnapshot = {
  base: "USD";
  rates: Record<string, number>;
  fetchedAt: number;
  source: "live" | "fallback";
};

// Match the backend FxService (1h cache, same feed) so the price shown here is
// the price Stripe charges when a customer pays an NGN booking in USD.
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

let memoryCache: FxRatesSnapshot | null = null;

function withUsdBase(rates: Record<string, number>): Record<string, number> {
  return { USD: 1, ...rates };
}

async function fetchLiveUsdRates(): Promise<Record<string, number> | null> {
  // open.er-api.com is free (no key) and, unlike ECB-based feeds, publishes
  // NGN. Fallbacks only fill codes the feed omits.
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 3_600 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      result?: string;
      rates?: Record<string, number>;
    };
    if (data.result !== "success" || !data.rates) return null;
    return withUsdBase({ ...FALLBACK_USD_RATES, ...data.rates });
  } catch {
    return null;
  }
}

export async function getUsdFxRates(): Promise<FxRatesSnapshot> {
  const now = Date.now();
  if (memoryCache && now - memoryCache.fetchedAt < CACHE_TTL_MS) {
    return memoryCache;
  }

  const live = await fetchLiveUsdRates();
  memoryCache = live
    ? { base: "USD", rates: live, fetchedAt: now, source: "live" }
    : {
        base: "USD",
        rates: { ...FALLBACK_USD_RATES },
        fetchedAt: now,
        source: "fallback",
      };

  return memoryCache;
}

export function getCachedUsdFxRates(): FxRatesSnapshot {
  return (
    memoryCache ?? {
      base: "USD",
      rates: { ...FALLBACK_USD_RATES },
      fetchedAt: 0,
      source: "fallback",
    }
  );
}

export function setClientFxRates(snapshot: FxRatesSnapshot) {
  memoryCache = snapshot;
}

export function convertWithRates(
  amount: number,
  fromCurrency: string,
  toCurrency: CurrencyCode,
  rates: Record<string, number>,
): number {
  const from = isCurrencyCode(fromCurrency) ? fromCurrency : "USD";
  const fromRate = rates[from] ?? FALLBACK_USD_RATES[from] ?? 1;
  const toRate = rates[toCurrency] ?? FALLBACK_USD_RATES[toCurrency] ?? 1;
  return (amount / fromRate) * toRate;
}
