import {
  convertCurrencyAmount,
  getCurrencyOption,
} from "@/lib/preferences/currencies";
import { getCachedUsdFxRates } from "@/lib/preferences/fx";
import type { CurrencyCode } from "@/lib/preferences/types";
import { usePreferencesStore } from "@/stores/preferences-store";

export function formatPriceWithPreferences(
  sourceCurrency: string,
  amount: number,
  displayCurrency: CurrencyCode = usePreferencesStore.getState().currency,
) {
  const option = getCurrencyOption(displayCurrency);
  const rates = getCachedUsdFxRates().rates;
  const converted = convertCurrencyAmount(
    amount,
    sourceCurrency,
    displayCurrency,
    rates,
  );

  const zeroDecimal =
    displayCurrency === "NGN" ||
    displayCurrency === "JPY" ||
    displayCurrency === "UGX" ||
    displayCurrency === "TZS" ||
    displayCurrency === "XOF" ||
    displayCurrency === "XAF";

  return `${displayCurrency} ${converted.toLocaleString(option.locale, {
    maximumFractionDigits: zeroDecimal ? 0 : 2,
  })}`;
}
