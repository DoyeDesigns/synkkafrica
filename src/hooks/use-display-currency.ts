"use client";

import { useCallback, useEffect, useMemo } from "react";

import { ensureClientFxRates } from "@/hooks/use-format-price";
import { convertCurrencyAmount } from "@/lib/preferences/currencies";
import { getCachedUsdFxRates } from "@/lib/preferences/fx";
import { currencySymbol } from "@/lib/preferences/price-filter";
import { usePreferencesStore } from "@/stores/preferences-store";

// The shopper's display currency — what result cards show prices in (see
// DisplayPrice / useFormatPrice) — with its symbol and a converter into it.
export function useDisplayCurrency() {
  const currency = usePreferencesStore((state) => state.currency);

  useEffect(() => {
    void ensureClientFxRates();
  }, []);

  // Reads the rate table at call time, like formatPriceWithPreferences, so
  // live rates loaded after mount are picked up.
  const toDisplay = useCallback(
    (amount: number, sourceCurrency: string) =>
      convertCurrencyAmount(
        amount,
        sourceCurrency,
        currency,
        getCachedUsdFxRates().rates,
      ),
    [currency],
  );

  return useMemo(
    () => ({
      currency,
      symbol: currencySymbol(currency),
      toDisplay,
    }),
    [currency, toDisplay],
  );
}
