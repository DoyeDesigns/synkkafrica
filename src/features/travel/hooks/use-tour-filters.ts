"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { getClearedResultsHref } from "@/features/travel/booking/clear-results-url";
import {
  DEFAULT_TOUR_FILTERS,
  TOUR_RESULTS,
  countActiveTourFilters,
  filterTourResults,
  type TourFilterState,
} from "@/features/travel/data/tour-results";

function getFiltersFromSearchParams(
  searchParams: URLSearchParams,
): TourFilterState {
  const location = searchParams.get("location");

  if (!location) {
    return DEFAULT_TOUR_FILTERS;
  }

  return {
    ...DEFAULT_TOUR_FILTERS,
    location,
  };
}

export function useTourFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [draftFilters, setDraftFilters] = useState<TourFilterState>(() =>
    getFiltersFromSearchParams(searchParams),
  );
  const [appliedFilters, setAppliedFilters] = useState<TourFilterState>(() =>
    getFiltersFromSearchParams(searchParams),
  );
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("query") ?? "",
  );

  useEffect(() => {
    const nextFilters = getFiltersFromSearchParams(searchParams);
    setDraftFilters(nextFilters);
    setAppliedFilters(nextFilters);
    setSearchQuery(searchParams.get("query") ?? "");
  }, [searchParams]);

  const activeFilterCount = useMemo(
    () => countActiveTourFilters(appliedFilters),
    [appliedFilters],
  );

  const draftFilterCount = useMemo(
    () => countActiveTourFilters(draftFilters),
    [draftFilters],
  );

  const results = useMemo(
    () => filterTourResults(TOUR_RESULTS, appliedFilters, searchQuery),
    [appliedFilters, searchQuery],
  );

  const updateDraftFilter = <K extends keyof TourFilterState>(
    key: K,
    value: TourFilterState[K],
  ) => {
    setDraftFilters((current) => ({ ...current, [key]: value }));
  };

  const applyFilters = () => {
    setAppliedFilters(draftFilters);
  };

  const resetFilters = () => {
    setDraftFilters(DEFAULT_TOUR_FILTERS);
    setAppliedFilters(DEFAULT_TOUR_FILTERS);
    setSearchQuery("");
    router.replace(getClearedResultsHref("tours", pathname), { scroll: false });
  };

  const hasAppliedFilters = activeFilterCount > 0;

  return {
    draftFilters,
    appliedFilters,
    searchQuery,
    activeFilterCount,
    draftFilterCount,
    results,
    setSearchQuery,
    updateDraftFilter,
    applyFilters,
    resetFilters,
    hasAppliedFilters,
  };
}
