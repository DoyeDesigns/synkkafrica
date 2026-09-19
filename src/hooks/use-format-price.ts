"use client";

import { useCallback, useEffect } from "react";

import { formatPriceWithPreferences } from "@/lib/preferences/format-price";
import {
  setClientFxRates,
  type FxRatesSnapshot,
} from "@/lib/preferences/fx";
import { usePreferencesStore } from "@/stores/preferences-store";

let fxFetchStarted = false;

async function ensureClientFxRates() {
  if (fxFetchStarted || typeof window === "undefined") return;
  fxFetchStarted = true;
  try {
    const res = await fetch("/api/fx");
    if (!res.ok) return;
    const snapshot = (await res.json()) as FxRatesSnapshot;
    setClientFxRates(snapshot);
  } catch {
    // Keep fallback rates already in memory.
  }
}

export function useFormatPrice() {
  const displayCurrency = usePreferencesStore((state) => state.currency);

  useEffect(() => {
    void ensureClientFxRates();
  }, []);

  return useCallback(
    (sourceCurrency: string, amount: number) =>
      formatPriceWithPreferences(sourceCurrency, amount, displayCurrency),
    [displayCurrency],
  );
}
