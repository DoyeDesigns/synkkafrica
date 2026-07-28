"use client";

import { CalendarDays, Layers, ShieldCheck, Users } from "lucide-react";

import type { TourPackageDetail } from "@/features/tour-packages/data/tour-package-booking";
import { useTranslation } from "@/hooks/use-translation";

type TourPackageHighlightsBarProps = {
  tourPackage: TourPackageDetail;
};

export function TourPackageHighlightsBar({
  tourPackage,
}: TourPackageHighlightsBarProps) {
  const t = useTranslation();

  const guestLabel =
    tourPackage.minGuests === tourPackage.maxGuests
      ? String(tourPackage.minGuests)
      : `${tourPackage.minGuests}-${tourPackage.maxGuests}`;

  const highlights = [
    {
      id: "duration",
      icon: CalendarDays,
      value: t("booking.package.durationShort", {
        days: tourPackage.days,
        nights: tourPackage.nights,
      }),
      label: t("booking.package.highlight.duration"),
    },
    {
      id: "guests",
      icon: Users,
      value: t("booking.package.guestRange", { range: guestLabel }),
      label: t("booking.package.highlight.groupSize"),
    },
    {
      id: "modules",
      icon: Layers,
      value: t("booking.package.moduleCount", {
        count: tourPackage.moduleCount,
      }),
      label: t("booking.package.highlight.included"),
    },
    {
      id: "cancellation",
      icon: ShieldCheck,
      value: tourPackage.freeCancellation
        ? t("booking.package.highlight.free")
        : t("booking.package.highlight.standard"),
      label: t("booking.package.highlight.cancellation"),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 rounded-2xl border border-[#E5E5E5] bg-white p-5 sm:grid-cols-4">
      {highlights.map(({ id, icon: Icon, value, label }) => (
        <div key={id} className="flex flex-col items-center gap-1 text-center">
          <Icon className="h-5 w-5 text-[#D85A30]" strokeWidth={1.75} />
          <p className="text-base font-bold font-satoshi text-foreground">{value}</p>
          <p className="text-xs font-medium font-satoshi text-foreground/60">
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}
