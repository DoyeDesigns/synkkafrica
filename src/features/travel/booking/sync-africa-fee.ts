// SynkAfrica service fee. Mirrors the backend's SERVICE_FEE_RATE
// (synkkafrica_backend src/common/checkout-pricing.ts): charged ONCE on the
// final booking subtotal (after days / nights / guests / add-ons), never per
// day or per night. The backend is authoritative for what is charged — the
// frontend computes the same number only to preview it.
export const SYNC_AFRICA_FEE_RATE = 0.06;

// 6% of the full pre-tax booking total, applied once. Callers must pass the
// summed stay (every day, room, guest, and add-on), not a single day's price.
export function calculateSyncAfricaFee(baseAmount: number) {
  return Math.round(Math.max(0, baseAmount) * SYNC_AFRICA_FEE_RATE);
}

// Two-decimal variant matching the backend rounding (round2(subtotal * rate)).
// Pass the listing's `feeRate` from the API when available.
export function calculateSyncAfricaFeeDecimal(
  baseAmount: number,
  rate: number = SYNC_AFRICA_FEE_RATE,
) {
  return Math.round(Math.max(0, baseAmount) * rate * 100) / 100;
}

// Whole-percent label for the fee line, e.g. 0.06 -> 6.
export function feeRatePercent(rate: number = SYNC_AFRICA_FEE_RATE) {
  return Math.round(rate * 10000) / 100;
}
