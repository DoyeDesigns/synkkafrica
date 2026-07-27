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
  total: number;
  currency: string;
  tierName: string;
};

export function calculateTourPackageBookingTotal({
  tierPrice,
  days = 1,
  baseDays = 1,
  taxesAndFees,
  currency,
  tierName,
}: TourPackageBookingPricingInput): TourPackageBookingPricingBreakdown {
  const safeDays = Math.max(1, days);
  const safeBaseDays = Math.max(1, baseDays);
  const dailyRate = tierPrice / safeBaseDays;
  const subtotal = Math.round(dailyRate * safeDays);
  const total = subtotal + taxesAndFees;

  return {
    subtotal,
    taxesAndFees,
    total,
    currency,
    tierName,
  };
}
