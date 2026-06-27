import {
  Check,
  CreditCard,
  Map,
  ShoppingCart,
  type LucideIcon,
} from "lucide-react";

export type TourPackageBookingStepId =
  | "choose-package"
  | "checkout"
  | "payment"
  | "confirmation";

export type TourPackageBookingStep = {
  id: TourPackageBookingStepId;
  label: string;
  icon: LucideIcon;
};

export const TOUR_PACKAGE_BOOKING_STEPS: TourPackageBookingStep[] = [
  { id: "choose-package", label: "Choose Package", icon: Map },
  { id: "checkout", label: "Checkout", icon: ShoppingCart },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "confirmation", label: "Confirmation", icon: Check },
];

export function getTourPackageBookingStepHref(
  packageId: string,
  step: TourPackageBookingStepId,
) {
  if (step === "choose-package") {
    return `/tour-packages/${packageId}/book`;
  }

  return `/tour-packages/${packageId}/book/${step}`;
}
