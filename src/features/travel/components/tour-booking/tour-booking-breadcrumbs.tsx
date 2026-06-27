"use client";

import Link from "next/link";

import { useTranslation } from "@/hooks/use-translation";

type TourBookingBreadcrumbsProps = {
  tourTitle: string;
};

export function TourBookingBreadcrumbs({ tourTitle }: TourBookingBreadcrumbsProps) {
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
            href="/?section=tours&view=results"
            className="font-medium text-[#D85A30] transition-opacity hover:opacity-80"
          >
            {t("breadcrumb.tours")}
          </Link>
        </li>
        <li aria-hidden="true" className="text-foreground/50">
          |
        </li>
        <li>
          <span className="font-medium text-foreground">{tourTitle}</span>
        </li>
      </ol>
    </nav>
  );
}
