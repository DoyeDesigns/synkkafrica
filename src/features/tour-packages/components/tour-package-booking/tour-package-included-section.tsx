"use client";

import { BedDouble, Car, Plane } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { DisplayPrice } from "@/components/display-price";
import type {
  PackageIncludedModule,
  PackageIncludedModuleType,
  TourPackageDetail,
} from "@/features/tour-packages/data/tour-package-booking";
import { useTranslation } from "@/hooks/use-translation";

type TourPackageIncludedSectionProps = {
  tourPackage: TourPackageDetail;
};

const MODULE_ICONS: Record<PackageIncludedModuleType, LucideIcon> = {
  flight: Plane,
  stay: BedDouble,
  car: Car,
};

function IncludedModuleCard({
  module,
  currency,
}: {
  module: PackageIncludedModule;
  currency: string;
}) {
  const t = useTranslation();
  const Icon = MODULE_ICONS[module.type];

  return (
    <article className="rounded-2xl border border-[#E5E5E5] bg-white p-5">
      <div className="flex gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#D85A30]">
          <Icon className="h-5 w-5 text-white" strokeWidth={1.75} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="text-sm font-bold font-satoshi uppercase tracking-wide text-foreground">
              {module.title}
            </h3>
            <p className="shrink-0 text-sm font-satoshi">
              <span className="text-foreground/50 line-through">
                <DisplayPrice currency={currency} amount={module.standalonePrice} />
              </span>{" "}
              <span className="font-semibold text-[#1B9B3C]">
                {t("booking.package.included")}
              </span>
            </p>
          </div>

          <div className="mt-3 space-y-1">
            {module.details.map((detail) => (
              <p
                key={detail}
                className="text-sm font-medium font-satoshi text-foreground/70"
              >
                {detail}
              </p>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

export function TourPackageIncludedSection({
  tourPackage,
}: TourPackageIncludedSectionProps) {
  const t = useTranslation();

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold font-montserrat text-foreground">
        {t("booking.package.whatsIncluded")}
      </h2>

      <div className="space-y-4">
        {tourPackage.includedModules.map((module) => (
          <IncludedModuleCard
            key={module.id}
            module={module}
            currency={tourPackage.currency}
          />
        ))}
      </div>
    </section>
  );
}
