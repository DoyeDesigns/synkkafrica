import { calculateSyncAfricaFeeDecimal } from "@/features/travel/booking/sync-africa-fee";

export type CarBookingPricingInput = {
  packagePrice: number;
  days?: number;
  currency: string;
  packageName: string;
  driverAddonPrice?: number;
  carRentalMode?: "self_drive" | "with_driver";
  deliveryFee?: number;
  requestDelivery?: boolean;
  // Listing fee rate from the API (falls back to SYNC_AFRICA_FEE_RATE).
  feeRate?: number;
};

export type CarBookingPricingBreakdown = {
  subtotal: number;
  driverAddon: number;
  deliveryFee: number;
  syncAfricaFee: number;
  total: number;
  currency: string;
  packageName: string;
};

// Matches the backend's car pricing: package rate x days, plus the driver
// add-on per day when a driver is requested, plus the delivery fee once (self
// drive only — a chauffeured car comes to the customer anyway). The service
// fee is then charged once on the whole subtotal.
export function calculateCarBookingTotal({
  packagePrice,
  days = 1,
  currency,
  packageName,
  driverAddonPrice = 0,
  carRentalMode = "self_drive",
  deliveryFee = 0,
  requestDelivery = false,
  feeRate,
}: CarBookingPricingInput): CarBookingPricingBreakdown {
  const safeDays = Math.max(1, days);
  const subtotal = packagePrice * safeDays;
  const driverAddon =
    carRentalMode === "with_driver"
      ? Math.max(0, driverAddonPrice) * safeDays
      : 0;
  const appliedDeliveryFee =
    carRentalMode === "self_drive" && requestDelivery ? Math.max(0, deliveryFee) : 0;
  const syncAfricaFee = calculateSyncAfricaFeeDecimal(
    subtotal + driverAddon + appliedDeliveryFee,
    feeRate,
  );
  const total = subtotal + driverAddon + appliedDeliveryFee + syncAfricaFee;

  return {
    subtotal,
    driverAddon,
    deliveryFee: appliedDeliveryFee,
    syncAfricaFee,
    total,
    currency,
    packageName,
  };
}
