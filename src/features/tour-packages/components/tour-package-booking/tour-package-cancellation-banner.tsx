"use client";

import { Info } from "lucide-react";

import type { TourPackageDetail } from "@/features/tour-packages/data/tour-package-booking";

type TourPackageCancellationBannerProps = {
  tourPackage: TourPackageDetail;
};

export function TourPackageCancellationBanner({
  tourPackage,
}: TourPackageCancellationBannerProps) {
  return (
    <div className="flex gap-3 rounded-2xl border border-[#BBDEFB] bg-[#EBF5FB] p-5">
      <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#1565C0]" strokeWidth={1.75} />
      <div>
        <p className="text-sm font-bold font-satoshi text-[#1565C0]">
          {tourPackage.cancellationDeadline}
        </p>
        <p className="mt-1 text-sm font-medium font-satoshi text-[#1565C0]/85">
          {tourPackage.cancellationDescription}
        </p>
      </div>
    </div>
  );
}
