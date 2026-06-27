"use client";

import { useCallback } from "react";

import { formatPriceWithPreferences } from "@/lib/preferences/format-price";
import { usePreferencesStore } from "@/stores/preferences-store";

export function useFormatPrice() {
  const displayCurrency = usePreferencesStore((state) => state.currency);

  return useCallback(
    (sourceCurrency: string, amount: number) =>
      formatPriceWithPreferences(sourceCurrency, amount, displayCurrency),
    [displayCurrency],
  );
}
