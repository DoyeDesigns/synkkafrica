"use client";

import { useMemo, useState } from "react";

import {
  ACCOMMODATION_RESULTS,
  DEFAULT_ACCOMMODATION_FILTERS,
  countActiveFilters,
  filterAccommodationResults,
  type AccommodationFilterState,
} from "@/features/travel/data/accommodation-results";

export function useAccommodationFilters() {
  const [draftFilters, setDraftFilters] =
    useState<AccommodationFilterState>(DEFAULT_ACCOMMODATION_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<AccommodationFilterState>(DEFAULT_ACCOMMODATION_FILTERS);
  const [searchQuery, setSearchQuery] = useState("");

  const activeFilterCount = useMemo(
    () => countActiveFilters(appliedFilters),
    [appliedFilters],
  );

  const draftFilterCount = useMemo(
    () => countActiveFilters(draftFilters),
    [draftFilters],
  );

  const results = useMemo(
    () => filterAccommodationResults(ACCOMMODATION_RESULTS, appliedFilters, searchQuery),
    [appliedFilters, searchQuery],
  );

  const updateDraftFilter = <K extends keyof AccommodationFilterState>(
    key: K,
    value: AccommodationFilterState[K],
  ) => {
    setDraftFilters((current) => ({ ...current, [key]: value }));
  };

  const applyFilters = () => {
    setAppliedFilters(draftFilters);
  };

  const resetFilters = () => {
    setDraftFilters(DEFAULT_ACCOMMODATION_FILTERS);
    setAppliedFilters(DEFAULT_ACCOMMODATION_FILTERS);
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
