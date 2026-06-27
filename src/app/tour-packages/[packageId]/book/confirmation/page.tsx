import { notFound } from "next/navigation";

import { TourPackageBookingPage } from "@/features/tour-packages/components/tour-package-booking/tour-package-booking-page";
import { getTourPackageById } from "@/features/tour-packages/data/tour-package-booking";

type TourPackageBookingConfirmationRouteProps = {
  params: Promise<{ packageId: string }>;
};

export default async function TourPackageBookingConfirmationRoute({
  params,
}: TourPackageBookingConfirmationRouteProps) {
  const { packageId } = await params;
  const tourPackage = getTourPackageById(packageId);

  if (!tourPackage) {
    notFound();
  }

  return (
    <TourPackageBookingPage
      tourPackage={tourPackage}
      currentStep="confirmation"
    />
  );
}
