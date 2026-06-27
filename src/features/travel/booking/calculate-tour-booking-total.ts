export type TourBookingPricingInput = {
  optionPrice: number;
  taxesAndFees: number;
  currency: string;
  optionName: string;
};

export type TourBookingPricingBreakdown = {
  subtotal: number;
  taxesAndFees: number;
  total: number;
  currency: string;
  optionName: string;
};

export function calculateTourBookingTotal({
  optionPrice,
  taxesAndFees,
  currency,
  optionName,
}: TourBookingPricingInput): TourBookingPricingBreakdown {
  const subtotal = optionPrice;
  const total = subtotal + taxesAndFees;

  return {
    subtotal,
    taxesAndFees,
    total,
    currency,
    optionName,
  };
}
