export const SYNC_AFRICA_FEE_RATE = 0.06;

export function calculateSyncAfricaFee(baseAmount: number) {
  return Math.round(Math.max(0, baseAmount) * SYNC_AFRICA_FEE_RATE);
}

export function calculateSyncAfricaFeeDecimal(baseAmount: number) {
  return Math.round(Math.max(0, baseAmount) * SYNC_AFRICA_FEE_RATE * 100) / 100;
}
