export type TourBookingPricingInput = {
  optionPrice: number;
  guestCount?: number;
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
  guestCount = 1,
  taxesAndFees,
  currency,
  optionName,
}: TourBookingPricingInput): TourBookingPricingBreakdown {
  const safeGuests = Math.max(1, guestCount);
  const subtotal = optionPrice * safeGuests;
  const total = subtotal + taxesAndFees;

  return {
    subtotal,
    taxesAndFees,
    total,
    currency,
    optionName,
  };
}
