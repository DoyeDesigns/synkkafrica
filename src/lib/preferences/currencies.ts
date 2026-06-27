import type { CurrencyCode } from "@/lib/preferences/types";

export type CurrencyOption = {
  code: CurrencyCode;
  name: string;
  locale: string;
};

/** Display rates: 1 unit of source currency expressed in NGN */
export const CURRENCY_TO_NGN: Record<CurrencyCode, number> = {
  NGN: 1,
  USD: 1580,
  GBP: 2000,
  KES: 12.2,
  GHS: 105,
  AED: 430,
  GMD: 23.5,
};

export const CURRENCIES: CurrencyOption[] = [
  { code: "NGN", name: "Naira", locale: "en-NG" },
  { code: "USD", name: "Dollars", locale: "en-US" },
  { code: "GBP", name: "Pound", locale: "en-GB" },
  { code: "KES", name: "Kenyan shilling(s)", locale: "en-KE" },
  { code: "GHS", name: "Cedi", locale: "en-GH" },
  { code: "AED", name: "Dirham", locale: "ar-AE" },
  { code: "GMD", name: "Gambian Dalasi", locale: "en-GM" },
];

export function getCurrencyOption(code: CurrencyCode) {
  return CURRENCIES.find((item) => item.code === code) ?? CURRENCIES[0];
}

export function convertCurrencyAmount(
  amount: number,
  fromCurrency: string,
  toCurrency: CurrencyCode,
): number {
  const fromRate = CURRENCY_TO_NGN[fromCurrency as CurrencyCode] ?? CURRENCY_TO_NGN.NGN;
  const toRate = CURRENCY_TO_NGN[toCurrency];
  const amountInNgn = amount * fromRate;

  return amountInNgn / toRate;
}
