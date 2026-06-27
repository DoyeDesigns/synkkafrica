"use client";

import { useMemo } from "react";

import { TRAVEL_SECTIONS } from "@/features/travel/constants";
import { useTranslation } from "@/hooks/use-translation";
import type { TravelSection } from "@/features/travel/types";
import type { TranslationKey } from "@/lib/preferences/translations";

const SECTION_LABEL_KEYS: Record<TravelSection, TranslationKey> = {
  accommodations: "hero.tab.accommodations",
  flights: "hero.tab.flights",
  "car-rentals": "hero.tab.carRentals",
  tours: "hero.tab.tours",
};

export function useTravelSections() {
  const t = useTranslation();

  return useMemo(
    () =>
      TRAVEL_SECTIONS.map((section) => ({
        ...section,
        label: t(SECTION_LABEL_KEYS[section.id]),
        headline: t("hero.headline"),
      })),
    [t],
  );
}
