import type { CurrencyCode } from "@/lib/preferences/types";

export type CurrencyOption = {
  code: CurrencyCode;
  name: string;
  locale: string;
};

export const CURRENCIES: CurrencyOption[] = [
  { code: "NGN", name: "Nigerian Naira", locale: "en-NG" },
  { code: "USD", name: "US Dollar", locale: "en-US" },
  { code: "EUR", name: "Euro", locale: "en-EU" },
  { code: "GBP", name: "British Pound", locale: "en-GB" },
  { code: "CAD", name: "Canadian Dollar", locale: "en-CA" },
  { code: "AUD", name: "Australian Dollar", locale: "en-AU" },
  { code: "ZAR", name: "South African Rand", locale: "en-ZA" },
  { code: "KES", name: "Kenyan Shilling", locale: "en-KE" },
  { code: "GHS", name: "Ghanaian Cedi", locale: "en-GH" },
  { code: "AED", name: "UAE Dirham", locale: "ar-AE" },
  { code: "GMD", name: "Gambian Dalasi", locale: "en-GM" },
  { code: "EGP", name: "Egyptian Pound", locale: "en-EG" },
  { code: "MAD", name: "Moroccan Dirham", locale: "en-MA" },
  { code: "TZS", name: "Tanzanian Shilling", locale: "en-TZ" },
  { code: "UGX", name: "Ugandan Shilling", locale: "en-UG" },
  { code: "XOF", name: "West African CFA Franc", locale: "fr-SN" },
  { code: "XAF", name: "Central African CFA Franc", locale: "fr-CM" },
  { code: "INR", name: "Indian Rupee", locale: "en-IN" },
  { code: "CNY", name: "Chinese Yuan", locale: "zh-CN" },
  { code: "JPY", name: "Japanese Yen", locale: "ja-JP" },
  { code: "CHF", name: "Swiss Franc", locale: "de-CH" },
  { code: "SEK", name: "Swedish Krona", locale: "sv-SE" },
  { code: "NOK", name: "Norwegian Krone", locale: "nb-NO" },
  { code: "DKK", name: "Danish Krone", locale: "da-DK" },
  { code: "NZD", name: "New Zealand Dollar", locale: "en-NZ" },
  { code: "SGD", name: "Singapore Dollar", locale: "en-SG" },
  { code: "HKD", name: "Hong Kong Dollar", locale: "en-HK" },
  { code: "BRL", name: "Brazilian Real", locale: "pt-BR" },
  { code: "MXN", name: "Mexican Peso", locale: "es-MX" },
  { code: "KRW", name: "South Korean Won", locale: "ko-KR" },
  { code: "TRY", name: "Turkish Lira", locale: "tr-TR" },
  { code: "RUB", name: "Russian Ruble", locale: "ru-RU" },
  { code: "IDR", name: "Indonesian Rupiah", locale: "id-ID" },
  { code: "THB", name: "Thai Baht", locale: "th-TH" },
  { code: "VND", name: "Vietnamese Dong", locale: "vi-VN" },
  { code: "PLN", name: "Polish Zloty", locale: "pl-PL" },
];

/** Last-known-good USD-based rates used when the live FX API is unavailable. */
export const FALLBACK_USD_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  NGN: 1580,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.36,
  AUD: 1.52,
  ZAR: 18.5,
  KES: 129,
  GHS: 15.1,
  AED: 3.67,
  GMD: 67.5,
  EGP: 48,
  MAD: 10.1,
  TZS: 2650,
  UGX: 3750,
  XOF: 605,
  XAF: 605,
  INR: 83,
  CNY: 7.2,
  JPY: 149,
  CHF: 0.88,
  SEK: 10.5,
  NOK: 10.7,
  DKK: 6.9,
  NZD: 1.64,
  SGD: 1.34,
  HKD: 7.8,
  BRL: 5.1,
  MXN: 17.2,
  KRW: 1350,
  TRY: 34,
  RUB: 92,
  IDR: 15800,
  THB: 35,
  VND: 25400,
  PLN: 4.0,
};

export function getCurrencyOption(code: CurrencyCode) {
  return CURRENCIES.find((item) => item.code === code) ?? CURRENCIES[0];
}

export function isCurrencyCode(value: string | null | undefined): value is CurrencyCode {
  return Boolean(value && CURRENCIES.some((item) => item.code === value));
}

/**
 * Convert using USD as the pivot. `rates` maps currency → units per 1 USD.
 */
export function convertCurrencyAmount(
  amount: number,
  fromCurrency: string,
  toCurrency: CurrencyCode,
  rates: Record<string, number> = FALLBACK_USD_RATES,
): number {
  const fromRate = rates[fromCurrency] ?? rates.USD ?? 1;
  const toRate = rates[toCurrency] ?? rates.USD ?? 1;
  const amountInUsd = amount / fromRate;
  return amountInUsd * toRate;
}
