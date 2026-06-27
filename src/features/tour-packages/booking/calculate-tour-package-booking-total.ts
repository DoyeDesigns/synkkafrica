export type TourPackageBookingPricingInput = {
  tierPrice: number;
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
  taxesAndFees,
  currency,
  tierName,
}: TourPackageBookingPricingInput): TourPackageBookingPricingBreakdown {
  const subtotal = tierPrice;
  const total = subtotal + taxesAndFees;

  return {
    subtotal,
    taxesAndFees,
    total,
    currency,
    tierName,
  };
}
