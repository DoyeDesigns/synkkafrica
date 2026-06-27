"use client";

import Image from "next/image";

import { CAR_RENTAL_FEATURES } from "@/features/travel/data/car-rentals-landing";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

const FEATURE_KEYS: {
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
}[] = [
  {
    titleKey: "landing.carRentals.feature1.title",
    descriptionKey: "landing.carRentals.feature1.description",
  },
  {
    titleKey: "landing.carRentals.feature2.title",
    descriptionKey: "landing.carRentals.feature2.description",
  },
  {
    titleKey: "landing.carRentals.feature3.title",
    descriptionKey: "landing.carRentals.feature3.description",
  },
];

function FeatureIcon() {
  return (
    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#D85A30]">
      <Image src="/money-bag.png" alt="Money" width={20} height={20} />
    </span>
  );
}

export function CarRentalsFeaturesBar() {
  const t = useTranslation();

  return (
    <section className="w-full bg-[#135391]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8 lg:py-12">
        {CAR_RENTAL_FEATURES.map((feature, index) => {
          const keys = FEATURE_KEYS[index];
          if (!keys) return null;

          return (
            <article key={feature.title} className="flex items-start gap-4">
              <FeatureIcon />
              <div className="min-w-0">
                <h3 className="text-base font-bold font-montserrat text-white sm:text-lg">
                  {t(keys.titleKey)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed font-satoshi text-white/90">
                  {t(keys.descriptionKey)}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
