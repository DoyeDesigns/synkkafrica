export type CarBookingPricingInput = {
  packagePrice: number;
  days?: number;
  taxesAndFees: number;
  currency: string;
  packageName: string;
};

export type CarBookingPricingBreakdown = {
  subtotal: number;
  taxesAndFees: number;
  total: number;
  currency: string;
  packageName: string;
};

export function calculateCarBookingTotal({
  packagePrice,
  days = 1,
  taxesAndFees,
  currency,
  packageName,
}: CarBookingPricingInput): CarBookingPricingBreakdown {
  const safeDays = Math.max(1, days);
  const subtotal = packagePrice * safeDays;
  const total = subtotal + taxesAndFees;

  return {
    subtotal,
    taxesAndFees,
    total,
    currency,
    packageName,
  };
}
