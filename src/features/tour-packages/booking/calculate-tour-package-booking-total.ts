import { calculateSyncAfricaFee } from "@/features/travel/booking/sync-africa-fee";

export type TourPackageBookingPricingInput = {
  tierPrice: number;
  days?: number;
  baseDays?: number;
  taxesAndFees: number;
  currency: string;
  tierName: string;
};

export type TourPackageBookingPricingBreakdown = {
  subtotal: number;
  taxesAndFees: number;
  syncAfricaFee: number;
  total: number;
  currency: string;
  tierName: string;
};

export function calculateTourPackageBookingTotal({
  tierPrice,
  days = 1,
  baseDays = 1,
  currency,
  tierName,
}: TourPackageBookingPricingInput): TourPackageBookingPricingBreakdown {
  const safeDays = Math.max(1, days);
  const safeBaseDays = Math.max(1, baseDays);
  const dailyRate = tierPrice / safeBaseDays;
  const subtotal = Math.round(dailyRate * safeDays);
  const syncAfricaFee = calculateSyncAfricaFee(subtotal);
  const total = subtotal + syncAfricaFee;

  return {
    subtotal,
    taxesAndFees: 0,
    syncAfricaFee,
    total,
    currency,
    tierName,
  };
}
