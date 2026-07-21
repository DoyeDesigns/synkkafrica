export type BookingPricingInput = {
  pricePerNight: number;
  nights: number;
  roomCount: number;
  guestCount?: number;
  includedGuests?: number;
  extraGuestFeePerNight?: number;
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
  guestCount = 2,
  includedGuests = 2,
  extraGuestFeePerNight = 0,
  taxesAndFees,
  currency,
}: BookingPricingInput & { currency: string }): BookingPricingBreakdown {
  const safeNights = Math.max(1, nights);
  const safeRooms = Math.max(1, roomCount);
  const extraGuests = Math.max(0, guestCount - includedGuests);
  const roomSubtotal = pricePerNight * safeNights * safeRooms;
  const guestSubtotal = extraGuestFeePerNight * extraGuests * safeNights * safeRooms;
  const subtotal = roomSubtotal + guestSubtotal;
  const total = subtotal + taxesAndFees;

  return {
    lineLabel: `${safeNights} night${safeNights > 1 ? "s" : ""} x ${safeRooms} room${safeRooms > 1 ? "s" : ""} x ${currency} ${pricePerNight.toLocaleString("en-NG")}`,
    subtotal,
    taxesAndFees,
    total,
    currency,
  };
}
