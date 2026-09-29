import { calculateSyncAfricaFeeDecimal } from "@/features/travel/booking/sync-africa-fee";

export type TourBookingPricingInput = {
  optionPrice: number;
  guestCount?: number;
  // A group ticket is a flat price regardless of guest count.
  isGroupTicket?: boolean;
  currency: string;
  optionName: string;
  // Listing fee rate from the API (falls back to SYNC_AFRICA_FEE_RATE).
  feeRate?: number;
};

export type TourBookingPricingBreakdown = {
  subtotal: number;
  syncAfricaFee: number;
  total: number;
  currency: string;
  optionName: string;
};

// Matches the backend's experience pricing: per-person price x guests (group
// tickets are flat), then the service fee once on that subtotal. Experiences
// are single-date bookings, so there is no per-day multiplier.
export function calculateTourBookingTotal({
  optionPrice,
  guestCount = 1,
  isGroupTicket = false,
  currency,
  optionName,
  feeRate,
}: TourBookingPricingInput): TourBookingPricingBreakdown {
  const safeGuests = Math.max(1, guestCount);
  const subtotal = isGroupTicket ? optionPrice : optionPrice * safeGuests;
  const syncAfricaFee = calculateSyncAfricaFeeDecimal(subtotal, feeRate);
  const total = subtotal + syncAfricaFee;

  return {
    subtotal,
    syncAfricaFee,
    total,
    currency,
    optionName,
  };
}
