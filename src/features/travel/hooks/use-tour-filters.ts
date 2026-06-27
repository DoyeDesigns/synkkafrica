"use client";

import { useMemo, useState } from "react";

import {
  DEFAULT_TOUR_FILTERS,
  TOUR_RESULTS,
  countActiveTourFilters,
  filterTourResults,
  type TourFilterState,
} from "@/features/travel/data/tour-results";

export function useTourFilters() {
  const [draftFilters, setDraftFilters] =
    useState<TourFilterState>(DEFAULT_TOUR_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<TourFilterState>(DEFAULT_TOUR_FILTERS);
  const [searchQuery, setSearchQuery] = useState("");

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
