import { calculateSyncAfricaFee } from "@/features/travel/booking/sync-africa-fee";

export type TourBookingPricingInput = {
  optionPrice: number;
  guestCount?: number;
  days?: number;
  taxesAndFees: number;
  currency: string;
  optionName: string;
};

export type TourBookingPricingBreakdown = {
  subtotal: number;
  taxesAndFees: number;
  syncAfricaFee: number;
  total: number;
  currency: string;
  optionName: string;
};

export function calculateTourBookingTotal({
  optionPrice,
  guestCount = 1,
  days = 1,
  currency,
  optionName,
}: TourBookingPricingInput): TourBookingPricingBreakdown {
  const safeGuests = Math.max(1, guestCount);
  const safeDays = Math.max(1, days);
  const subtotal = optionPrice * safeGuests * safeDays;
  const syncAfricaFee = calculateSyncAfricaFee(subtotal);
  const total = subtotal + syncAfricaFee;

  return {
    subtotal,
    taxesAndFees: 0,
    syncAfricaFee,
    total,
    currency,
    optionName,
  };
}
