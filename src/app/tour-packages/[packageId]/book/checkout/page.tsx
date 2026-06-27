import { Suspense } from "react";
import { notFound } from "next/navigation";

import { TourPackageBookingPage } from "@/features/tour-packages/components/tour-package-booking/tour-package-booking-page";
import { getTourPackageById } from "@/features/tour-packages/data/tour-package-booking";

type TourPackageBookingCheckoutRouteProps = {
  params: Promise<{ packageId: string }>;
};

export default async function TourPackageBookingCheckoutRoute({
  params,
}: TourPackageBookingCheckoutRouteProps) {
  const { packageId } = await params;
  const tourPackage = getTourPackageById(packageId);

  if (!tourPackage) {
    notFound();
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F5F5]" />}>
      <TourPackageBookingPage tourPackage={tourPackage} currentStep="checkout" />
    </Suspense>
  );
}
