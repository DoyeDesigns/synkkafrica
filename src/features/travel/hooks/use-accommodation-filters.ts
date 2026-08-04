"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { getClearedResultsHref } from "@/features/travel/booking/clear-results-url";
import {
  DEFAULT_ACCOMMODATION_FILTERS,
  countActiveFilters,
  filterAccommodationResults,
  type AccommodationFilterState,
} from "@/features/travel/data/accommodation-results";
import {
  listAccommodations,
  toAccommodationResult,
} from "@/lib/api/accommodations";

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

  // Re-sync editable state whenever the URL changes, using React's
  // adjust-state-during-render pattern (no setState-in-effect).
  const searchKey = searchParams.toString();
  const [prevSearchKey, setPrevSearchKey] = useState(searchKey);
  if (searchKey !== prevSearchKey) {
    setPrevSearchKey(searchKey);
    const nextFilters = getFiltersFromSearchParams(searchParams);
    setDraftFilters(nextFilters);
    setAppliedFilters(nextFilters);
    setSearchQuery(searchParams.get("destination") ?? "");
  }

  const activeFilterCount = useMemo(
    () => countActiveFilters(appliedFilters),
    [appliedFilters],
  );

  const draftFilterCount = useMemo(
    () => countActiveFilters(draftFilters),
    [draftFilters],
  );

  // Live vendor accommodation listings (admin-approved). Filtering stays
  // client-side over the fetched set, matching the previous behavior.
  const { data: liveResults, isLoading } = useQuery({
    queryKey: ["accommodations"],
    queryFn: listAccommodations,
    refetchOnWindowFocus: false,
  });

  const allResults = useMemo(
    () => (liveResults ?? []).map(toAccommodationResult),
    [liveResults],
  );

  const results = useMemo(
    () => filterAccommodationResults(allResults, appliedFilters, searchQuery),
    [allResults, appliedFilters, searchQuery],
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
    isLoading,
    setSearchQuery,
    updateDraftFilter,
    applyFilters,
    resetFilters,
    hasAppliedFilters,
  };
}
