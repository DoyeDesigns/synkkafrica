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
  taxesAndFees,
  currency,
  optionName,
}: TourBookingPricingInput): TourBookingPricingBreakdown {
  const safeGuests = Math.max(1, guestCount);
  const safeDays = Math.max(1, days);
  const subtotal = optionPrice * safeGuests * safeDays;
  const syncAfricaFee = calculateSyncAfricaFee(subtotal + taxesAndFees);
  const total = subtotal + taxesAndFees + syncAfricaFee;

  return {
    subtotal,
    taxesAndFees,
    syncAfricaFee,
    total,
    currency,
    optionName,
  };
}
