"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { getClearedResultsHref } from "@/features/travel/booking/clear-results-url";
import {
  DEFAULT_TOUR_FILTERS,
  countActiveTourFilters,
  filterTourResults,
  type TourFilterState,
} from "@/features/travel/data/tour-results";
import { listExperiences, toTourResult } from "@/lib/api/experiences";

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

  // Re-sync editable state on URL change via adjust-state-during-render.
  const searchKey = searchParams.toString();
  const [prevSearchKey, setPrevSearchKey] = useState(searchKey);
  if (searchKey !== prevSearchKey) {
    setPrevSearchKey(searchKey);
    const nextFilters = getFiltersFromSearchParams(searchParams);
    setDraftFilters(nextFilters);
    setAppliedFilters(nextFilters);
    setSearchQuery(searchParams.get("query") ?? "");
  }

  const activeFilterCount = useMemo(
    () => countActiveTourFilters(appliedFilters),
    [appliedFilters],
  );

  const draftFilterCount = useMemo(
    () => countActiveTourFilters(draftFilters),
    [draftFilters],
  );

  const { data: liveTours, isLoading } = useQuery({
    queryKey: ["experiences"],
    queryFn: listExperiences,
    refetchOnWindowFocus: false,
  });

  const allResults = useMemo(
    () => (liveTours ?? []).map(toTourResult),
    [liveTours],
  );

  const results = useMemo(
    () => filterTourResults(allResults, appliedFilters, searchQuery),
    [allResults, appliedFilters, searchQuery],
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

  const hasAppliedFilters =
    activeFilterCount > 0 || searchQuery.trim().length > 0;

  return {
    draftFilters,
    appliedFilters,
    searchQuery,
    activeFilterCount,
    draftFilterCount,
    results,
    isLoading,
    setSearchQuery,
    updateDraftFilter,
    applyFilters,
    resetFilters,
    hasAppliedFilters,
  };
}
