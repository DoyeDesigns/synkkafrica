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
import { useDisplayCurrency } from "@/hooks/use-display-currency";

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

  // Budgets are typed in the display currency (what result cards show).
  const { toDisplay } = useDisplayCurrency();
  const results = useMemo(
    () => filterAccommodationResults(allResults, appliedFilters, searchQuery, toDisplay),
    [allResults, appliedFilters, searchQuery, toDisplay],
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

  // Set one filter and apply the draft right away (e.g. picking a location
  // suggestion should filter immediately, without a separate "Apply" click).
  const applyFilter = <K extends keyof AccommodationFilterState>(
    key: K,
    value: AccommodationFilterState[K],
  ) => {
    const next = { ...draftFilters, [key]: value };
    setDraftFilters(next);
    setAppliedFilters(next);
  };

  const resetFilters = () => {
    setDraftFilters(DEFAULT_ACCOMMODATION_FILTERS);
    setAppliedFilters(DEFAULT_ACCOMMODATION_FILTERS);
    setSearchQuery("");
    router.replace(getClearedResultsHref("accommodations", pathname), {
      scroll: false,
    });
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
    applyFilter,
    resetFilters,
    hasAppliedFilters,
  };
}
