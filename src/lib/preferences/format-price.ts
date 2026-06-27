import {
  convertCurrencyAmount,
  getCurrencyOption,
} from "@/lib/preferences/currencies";
import type { CurrencyCode } from "@/lib/preferences/types";
import { usePreferencesStore } from "@/stores/preferences-store";

export function formatPriceWithPreferences(
  sourceCurrency: string,
  amount: number,
  displayCurrency: CurrencyCode = usePreferencesStore.getState().currency,
) {
  const option = getCurrencyOption(displayCurrency);
  const converted = convertCurrencyAmount(amount, sourceCurrency, displayCurrency);

  return `${displayCurrency} ${converted.toLocaleString(option.locale, {
    maximumFractionDigits: displayCurrency === "NGN" ? 0 : 2,
  })}`;
}
