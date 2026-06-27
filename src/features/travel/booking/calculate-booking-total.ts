export type BookingPricingInput = {
  pricePerNight: number;
  nights: number;
  roomCount: number;
  taxesAndFees: number;
};

export type BookingPricingBreakdown = {
  lineLabel: string;
  subtotal: number;
  taxesAndFees: number;
  total: number;
  currency: string;
};

export function calculateBookingTotal({
  pricePerNight,
  nights,
  roomCount,
  taxesAndFees,
  currency,
}: BookingPricingInput & { currency: string }): BookingPricingBreakdown {
  const safeNights = Math.max(1, nights);
  const safeRooms = Math.max(1, roomCount);
  const subtotal = pricePerNight * safeNights * safeRooms;
  const total = subtotal + taxesAndFees;

  return {
    lineLabel: `${safeNights} night${safeNights > 1 ? "s" : ""} x ${safeRooms} room${safeRooms > 1 ? "s" : ""} x ${currency} ${pricePerNight.toLocaleString("en-NG")}`,
    subtotal,
    taxesAndFees,
    total,
    currency,
  };
}
