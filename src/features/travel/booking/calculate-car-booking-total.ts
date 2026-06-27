export type CarBookingPricingInput = {
  packagePrice: number;
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
  taxesAndFees,
  currency,
  packageName,
}: CarBookingPricingInput): CarBookingPricingBreakdown {
  const subtotal = packagePrice;
  const total = subtotal + taxesAndFees;

  return {
    subtotal,
    taxesAndFees,
    total,
    currency,
    packageName,
  };
}
