"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import {
  getDefaultSection,
  isTravelSection,
  TRAVEL_SECTION_MAP,
} from "@/features/travel/constants";
import { buildSearchKey, travelQueryKeys } from "@/features/travel/query-keys";
import type { TravelSection } from "@/features/travel/types";
import { useTravelNavigation } from "@/features/travel/hooks/use-travel-navigation";

async function fetchSectionLanding(section: TravelSection) {
  await new Promise((resolve) => setTimeout(resolve, 150));
  return TRAVEL_SECTION_MAP[section].landingBlurb;
}

async function fetchSectionResults(section: TravelSection, searchKey: string) {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return `${TRAVEL_SECTION_MAP[section].resultsBlurb} (${searchKey})`;
}

export function useSectionContent() {
  const { section, view, searchParams, isPending } = useTravelNavigation();

  const searchKey = useMemo(
    () =>
      buildSearchKey(
        section,
        Object.fromEntries(
          Object.entries(searchParams).filter(
            ([key]) => key !== "section" && key !== "view",
          ),
        ),
      ),
    [section, searchParams],
  );

  const landingQuery = useQuery({
    queryKey: travelQueryKeys.landing(section),
    queryFn: () => fetchSectionLanding(section),
    enabled: view === "landing",
    staleTime: 5 * 60 * 1000,
  });

  const resultsQuery = useQuery({
    queryKey: travelQueryKeys.results(section, searchKey),
    queryFn: () => fetchSectionResults(section, searchKey),
    enabled: view === "results",
    staleTime: 2 * 60 * 1000,
  });

  return {
    section,
    view,
    config: TRAVEL_SECTION_MAP[section],
    isPending,
    content:
      view === "results" ? resultsQuery.data : landingQuery.data,
    isLoading:
      view === "results" ? resultsQuery.isLoading : landingQuery.isLoading,
  };
}

export function resolveSectionFromParam(value: string | null): TravelSection {
  if (value && isTravelSection(value)) {
    return value;
  }

  return getDefaultSection();
}
