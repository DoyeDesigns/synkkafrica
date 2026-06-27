"use client";

import Link from "next/link";

import { TOUR_PACKAGES_PATH } from "@/features/tour-packages/data/tour-packages";
import { useTranslation } from "@/hooks/use-translation";

type TourPackageBookingBreadcrumbsProps = {
  packageTitle: string;
};

export function TourPackageBookingBreadcrumbs({
  packageTitle,
}: TourPackageBookingBreadcrumbsProps) {
  const t = useTranslation();

  return (
    <nav aria-label="Breadcrumb" className="text-sm font-satoshi">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link
            href="/"
            className="font-medium text-[#D85A30] transition-opacity hover:opacity-80"
          >
            {t("breadcrumb.synkkAfrica")}
          </Link>
        </li>
        <li aria-hidden="true" className="text-foreground/50">
          |
        </li>
        <li>
          <Link
            href={TOUR_PACKAGES_PATH}
            className="font-medium text-[#D85A30] transition-opacity hover:opacity-80"
          >
            {t("breadcrumb.tourPackages")}
          </Link>
        </li>
        <li aria-hidden="true" className="text-foreground/50">
          |
        </li>
        <li>
          <span className="font-medium text-foreground">{packageTitle}</span>
        </li>
      </ol>
    </nav>
  );
}
