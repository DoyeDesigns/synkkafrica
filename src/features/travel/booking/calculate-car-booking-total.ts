import { calculateSyncAfricaFee } from "@/features/travel/booking/sync-africa-fee";

export type CarBookingPricingInput = {
  packagePrice: number;
  days?: number;
  taxesAndFees: number;
  currency: string;
  packageName: string;
  driverAddonPrice?: number;
  carRentalMode?: "self_drive" | "with_driver";
  deliveryFee?: number;
  requestDelivery?: boolean;
};

export type CarBookingPricingBreakdown = {
  subtotal: number;
  driverAddon: number;
  deliveryFee: number;
  taxesAndFees: number;
  syncAfricaFee: number;
  total: number;
  currency: string;
  packageName: string;
};

export function calculateCarBookingTotal({
  packagePrice,
  days = 1,
  taxesAndFees,
  currency,
  packageName,
  driverAddonPrice = 0,
  carRentalMode = "self_drive",
  deliveryFee = 0,
  requestDelivery = false,
}: CarBookingPricingInput): CarBookingPricingBreakdown {
  const safeDays = Math.max(1, days);
  const subtotal = packagePrice * safeDays;
  const driverAddon =
    carRentalMode === "with_driver" ? Math.max(0, driverAddonPrice) : 0;
  const appliedDeliveryFee =
    carRentalMode === "self_drive" && requestDelivery ? Math.max(0, deliveryFee) : 0;
  const syncAfricaFee = calculateSyncAfricaFee(
    subtotal + driverAddon + appliedDeliveryFee + taxesAndFees,
  );
  const total = subtotal + driverAddon + appliedDeliveryFee + taxesAndFees + syncAfricaFee;

  return {
    subtotal,
    driverAddon,
    deliveryFee: appliedDeliveryFee,
    taxesAndFees,
    syncAfricaFee,
    total,
    currency,
    packageName,
  };
}
