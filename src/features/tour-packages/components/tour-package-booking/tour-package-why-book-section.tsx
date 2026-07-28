"use client";

import {
  BadgeCheck,
  Headphones,
  PiggyBank,
  Receipt,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { TourPackageDetail } from "@/features/tour-packages/data/tour-package-booking";
import { useTranslation } from "@/hooks/use-translation";

type TourPackageWhyBookSectionProps = {
  tourPackage: TourPackageDetail;
};

const REASON_ICONS: Record<string, LucideIcon> = {
  "one-payment": Receipt,
  "vetted-vendors": BadgeCheck,
  "trip-support": Headphones,
  savings: PiggyBank,
};

export function TourPackageWhyBookSection({
  tourPackage,
}: TourPackageWhyBookSectionProps) {
  const t = useTranslation();

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold font-montserrat text-foreground">
        {t("booking.package.whyBook")}
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        {tourPackage.whyBookReasons.map((reason) => {
          const Icon = REASON_ICONS[reason.id] ?? Receipt;

          return (
            <article
              key={reason.id}
              className="rounded-2xl border border-[#E5E5E5] bg-white p-5"
            >
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0F4FF]">
                  <Icon className="h-5 w-5 text-[#4F6BED]" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-satoshi text-foreground">
                    {reason.title}
                  </h3>
                  <p className="mt-1 text-sm font-medium font-satoshi text-foreground/70">
                    {reason.description}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
