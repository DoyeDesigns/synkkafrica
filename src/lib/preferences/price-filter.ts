import { getCurrencyOption } from "@/lib/preferences/currencies";
import type { CurrencyCode } from "@/lib/preferences/types";

// Narrow symbol for a currency ("₦", "$", "€", "£", …), matching what a
// shopper expects next to a price input. Falls back to the ISO code.
export function currencySymbol(code: CurrencyCode): string {
  try {
    const part = new Intl.NumberFormat(getCurrencyOption(code).locale, {
      style: "currency",
      currency: code,
      currencyDisplay: "narrowSymbol",
    })
      .formatToParts(0)
      .find((p) => p.type === "currency");
    return part?.value ?? code;
  } catch {
    return code;
  }
}

export type PriceSliderBounds = { min: number; max: number; step: number };

// 1, 2, 5 × 10^n — the nearest "round" step to `x`.
function niceStep(x: number): number {
  if (!Number.isFinite(x) || x <= 1) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(x));
  const n = x / magnitude;
  const nice = n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10;
  return nice * magnitude;
}

// Results filters define their slider in Naira. Re-express it in the display
// currency (the one result cards show prices in) with round numbers, so the
// budget a shopper types or slides is in the currency they are looking at.
export function scalePriceSlider(
  ngn: PriceSliderBounds,
  fromNgn: (amount: number) => number,
  displayCurrency: CurrencyCode,
): PriceSliderBounds {
  if (displayCurrency === "NGN") return ngn;
  const step = niceStep(fromNgn(ngn.step));
  const max = Math.max(step * 2, Math.ceil(fromNgn(ngn.max) / step) * step);
  const min = Math.min(
    max - step,
    Math.max(step, Math.floor(fromNgn(ngn.min) / step) * step),
  );
  return { min, max, step };
}
