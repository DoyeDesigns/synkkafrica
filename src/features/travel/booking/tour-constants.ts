import {
  Check,
  Compass,
  CreditCard,
  ShoppingCart,
  type LucideIcon,
} from "lucide-react";

export type TourBookingStepId =
  | "choose-experience"
  | "checkout"
  | "payment"
  | "confirmation";

export type TourBookingStep = {
  id: TourBookingStepId;
  label: string;
  icon: LucideIcon;
};

export const TOUR_BOOKING_STEPS: TourBookingStep[] = [
  { id: "choose-experience", label: "Choose Experience", icon: Compass },
  { id: "checkout", label: "Checkout", icon: ShoppingCart },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "confirmation", label: "Confirmation", icon: Check },
];

export function getTourBookingStepHref(tourId: string, step: TourBookingStepId) {
  if (step === "choose-experience") {
    return `/tours/${tourId}/book`;
  }

  return `/tours/${tourId}/book/${step}`;
}
