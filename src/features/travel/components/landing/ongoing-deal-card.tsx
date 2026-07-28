"use client";

import { BedDouble, Car, Plane } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { DisplayPrice } from "@/components/display-price";
import type {
  AccommodationDeal,
  PackageOfferInclusion,
} from "@/features/travel/data/accommodations-landing";
import { getTourPackageBookingPath } from "@/features/tour-packages/booking/tour-package-paths";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

type OngoingDealCardProps = {
  item: AccommodationDeal;
};

const INCLUSION_CONFIG: Record<
  PackageOfferInclusion,
  { icon: LucideIcon; labelKey: TranslationKey }
> = {
  flights: { icon: Plane, labelKey: "landing.packageOffer.inclusion.flights" },
  stays: { icon: BedDouble, labelKey: "landing.packageOffer.inclusion.stays" },
  carDriver: { icon: Car, labelKey: "landing.packageOffer.inclusion.carDriver" },
};

export function OngoingDealCard({ item }: OngoingDealCardProps) {
  const t = useTranslation();
  const href = item.packageId
    ? getTourPackageBookingPath(item.packageId)
    : `/tour-packages/${item.id}/book`;

  return (
    <Link
      href={href}
      className="group relative block h-[240px] w-[280px] shrink-0 overflow-hidden rounded-[28px] sm:h-[260px] sm:w-[360px] md:h-[280px] md:w-[440px] lg:w-[520px]"
    >
      <Image
        src={item.image}
        alt={item.title}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        sizes="(max-width: 640px) 280px, (max-width: 768px) 360px, (max-width: 1024px) 440px, 520px"
      />

      <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/45 to-black/20" />

      {item.savingsPercent > 0 ? (
        <span className="absolute right-5 top-5 rounded-full bg-[#1B9B3C] px-3 py-1.5 text-sm font-bold font-satoshi text-white">
          -{item.savingsPercent}%
        </span>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap gap-2">
          {item.inclusions.map((inclusion) => {
            const config = INCLUSION_CONFIG[inclusion];
            const Icon = config.icon;

            return (
              <span
                key={inclusion}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-black/25 px-3 py-1.5 text-xs font-semibold font-satoshi text-white backdrop-blur-sm"
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                {t(config.labelKey)}
              </span>
            );
          })}
        </div>

        <h3 className="text-xl font-bold font-satoshi leading-tight text-white sm:text-2xl">
          {item.title}
        </h3>

        <p className="mt-1 text-sm font-medium font-satoshi text-white/90">
          {t("landing.packageOffer.duration", {
            days: item.days,
            nights: item.nights,
            schedule: item.scheduleLabel,
          })}
        </p>

        <p className="mt-3 text-2xl font-bold font-satoshi text-[#D85A30] sm:text-3xl">
          <DisplayPrice currency={item.currency} amount={item.currentPrice} />
        </p>

        <p className="mt-1 text-sm font-medium font-satoshi text-white/90">
          <span className="line-through">
            <DisplayPrice currency={item.currency} amount={item.separateBookingPrice} />
          </span>{" "}
          {t("landing.packageOffer.bookedSeparately")}
        </p>
      </div>
    </Link>
  );
}
