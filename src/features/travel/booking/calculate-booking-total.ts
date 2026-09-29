import { calculateSyncAfricaFeeDecimal } from "@/features/travel/booking/sync-africa-fee";

export type BookingPricingInput = {
  pricePerNight: number;
  nights: number;
  roomCount: number;
  // Listing fee rate from the API (falls back to SYNC_AFRICA_FEE_RATE).
  feeRate?: number;
};

export type BookingPricingBreakdown = {
  lineLabel: string;
  subtotal: number;
  syncAfricaFee: number;
  total: number;
  currency: string;
};

// Matches the backend's accommodation pricing: nightly price x nights x rooms,
// then the service fee once on that subtotal. There is no per-guest surcharge
// and no separate taxes line — the backend charges exactly subtotal + fee.
export function calculateBookingTotal({
  pricePerNight,
  nights,
  roomCount,
  feeRate,
  currency,
}: BookingPricingInput & { currency: string }): BookingPricingBreakdown {
  const safeNights = Math.max(1, nights);
  const safeRooms = Math.max(1, roomCount);
  const subtotal = pricePerNight * safeNights * safeRooms;
  const syncAfricaFee = calculateSyncAfricaFeeDecimal(subtotal, feeRate);
  const total = subtotal + syncAfricaFee;

  return {
    lineLabel: `${safeNights} night${safeNights > 1 ? "s" : ""} x ${safeRooms} room${safeRooms > 1 ? "s" : ""} x ${currency} ${pricePerNight.toLocaleString("en-NG")}`,
    subtotal,
    syncAfricaFee,
    total,
    currency,
  };
}
