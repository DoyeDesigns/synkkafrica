import {
  BedDouble,
  Car,
  Check,
  CheckCircle2,
  CreditCard,
  ShoppingCart,
  type LucideIcon,
} from "lucide-react";

export type BookingStepId = "rooms" | "checkout" | "payment" | "confirmation";

export type BookingStep = {
  id: BookingStepId;
  label: string;
  icon: LucideIcon;
};

export const BOOKING_STEPS: BookingStep[] = [
  { id: "rooms", label: "Choose Stay and Rooms", icon: BedDouble },
  { id: "checkout", label: "Checkout", icon: ShoppingCart },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "confirmation", label: "Confirmation", icon: Check },
];

export function getBookingStepHref(propertyId: string, step: BookingStepId) {
  if (step === "rooms") {
    return `/accommodations/${propertyId}/book`;
  }

  return `/accommodations/${propertyId}/book/${step}`;
}
