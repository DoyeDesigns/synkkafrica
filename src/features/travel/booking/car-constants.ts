import { Car, Check, CreditCard, ShoppingCart, type LucideIcon } from "lucide-react";

export type CarBookingStepId =
  | "choose-car"
  | "checkout"
  | "payment"
  | "confirmation";

export type CarBookingStep = {
  id: CarBookingStepId;
  label: string;
  icon: LucideIcon;
};

export const CAR_BOOKING_STEPS: CarBookingStep[] = [
  { id: "choose-car", label: "Choose Car", icon: Car },
  { id: "checkout", label: "Checkout", icon: ShoppingCart },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "confirmation", label: "Confirmation", icon: Check },
];

export function getCarBookingStepHref(carId: string, step: CarBookingStepId) {
  if (step === "choose-car") {
    return `/car-rentals/${carId}/book`;
  }

  return `/car-rentals/${carId}/book/${step}`;
}
