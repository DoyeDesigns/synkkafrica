"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import {
  getAccommodationsPropertyTypeResultsHref,
  PROPERTY_TYPES,
} from "@/features/travel/data/accommodations-landing";
import { TRAVEL_CAROUSEL_SCROLL_CLASS } from "@/features/travel/constants";
import { useFilterOptionLabel } from "@/hooks/use-filter-option-label";
import { useTranslation } from "@/hooks/use-translation";
import { listAccommodations } from "@/lib/api/accommodations";
import { PropertyTypeImage } from "./shared";
import { FlightAvailabilityPromo } from "../shared/flight-availability-promo";

export function BrowsePropertyTypeSection() {
  const t = useTranslation();
  const { labelPropertyTypeId } = useFilterOptionLabel();

  // Real counts per property type from live listings. The vendor's
  // `propertyType` value matches these labels exactly.
  const { data } = useQuery({
    queryKey: ["accommodations"],
    queryFn: listAccommodations,
    refetchOnWindowFocus: false,
  });
  const countByType = (data ?? []).reduce<Record<string, number>>(
    (acc, listing) => {
      const key = (listing.propertyType ?? "").toLowerCase();
      if (key) acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    },
    {},
  );

  return (
    <section className="space-y-12 pt-22 pb-16">
      <h2 className="text-center text-[22px] font-montserrat font-bold text-foreground">
        {t("landing.browsePropertyType")}
      </h2>

      <div className={`flex justify-center gap-5 overflow-x-auto ${TRAVEL_CAROUSEL_SCROLL_CLASS}`}>
        {PROPERTY_TYPES.map((type) => (
          <Link
            key={type.id}
            href={getAccommodationsPropertyTypeResultsHref(type.id)}
            className="relative flex min-w-[135px] h-[126px] shrink-0 flex-col items-center justify-center gap-3 rounded-xl border border-black/10 bg-white transition-colors hover:border-[#D85A30]"
          >
            <PropertyTypeImage src={type.image} alt={type.label} />

            <div className="text-center">
              <p className="text-sm font-bold font-satoshi text-foreground">
                {labelPropertyTypeId(type.id, type.label)}
              </p>
              <p className="text-lg font-medium font-satoshi text-[#D85A30]">
                ({countByType[type.label.toLowerCase()] ?? 0})
              </p>
            </div>
          </Link>
        ))}
      </div>

      <FlightAvailabilityPromo />
    </section>
  );
}
