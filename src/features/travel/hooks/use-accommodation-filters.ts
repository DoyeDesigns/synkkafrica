"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { getClearedResultsHref } from "@/features/travel/booking/clear-results-url";
import {
  ACCOMMODATION_RESULTS,
  DEFAULT_ACCOMMODATION_FILTERS,
  countActiveFilters,
  filterAccommodationResults,
  type AccommodationFilterState,
} from "@/features/travel/data/accommodation-results";

function getFiltersFromSearchParams(
  searchParams: URLSearchParams,
): AccommodationFilterState {
  const propertyType = searchParams.get("propertyType");

  if (!propertyType) {
    return DEFAULT_ACCOMMODATION_FILTERS;
  }

  return {
    ...DEFAULT_ACCOMMODATION_FILTERS,
    propertyType,
  };
}

export function useAccommodationFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [draftFilters, setDraftFilters] = useState<AccommodationFilterState>(
    () => getFiltersFromSearchParams(searchParams),
  );
  const [appliedFilters, setAppliedFilters] = useState<AccommodationFilterState>(
    () => getFiltersFromSearchParams(searchParams),
  );
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("destination") ?? "",
  );

  useEffect(() => {
    setSearchQuery(searchParams.get("destination") ?? "");
    const nextFilters = getFiltersFromSearchParams(searchParams);
    setDraftFilters(nextFilters);
    setAppliedFilters(nextFilters);
  }, [searchParams]);

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
    router.replace(getClearedResultsHref("accommodations", pathname), {
      scroll: false,
    });
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
