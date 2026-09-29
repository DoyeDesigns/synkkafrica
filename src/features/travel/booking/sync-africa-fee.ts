export const SYNC_AFRICA_FEE_RATE = 0.06;

// 6% of the full pre-tax booking total, applied once. Callers must pass the
// summed stay (every day, room, guest, and add-on), not a single day's price.
export function calculateSyncAfricaFee(baseAmount: number) {
  return Math.round(Math.max(0, baseAmount) * SYNC_AFRICA_FEE_RATE);
}

export function calculateSyncAfricaFeeDecimal(baseAmount: number) {
  return Math.round(Math.max(0, baseAmount) * SYNC_AFRICA_FEE_RATE * 100) / 100;
}
