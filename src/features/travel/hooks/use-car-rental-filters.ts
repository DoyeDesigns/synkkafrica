"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { getClearedResultsHref } from "@/features/travel/booking/clear-results-url";
import {
  CAR_RENTAL_RESULTS,
  DEFAULT_CAR_RENTAL_FILTERS,
  countActiveCarRentalFilters,
  filterCarRentalResults,
  type CarRentalFilterState,
} from "@/features/travel/data/car-rental-results";

export function useCarRentalFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const [draftFilters, setDraftFilters] =
    useState<CarRentalFilterState>(DEFAULT_CAR_RENTAL_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<CarRentalFilterState>(DEFAULT_CAR_RENTAL_FILTERS);
  const [searchQuery, setSearchQuery] = useState("");

  const activeFilterCount = useMemo(
    () => countActiveCarRentalFilters(appliedFilters),
    [appliedFilters],
  );

  const draftFilterCount = useMemo(
    () => countActiveCarRentalFilters(draftFilters),
    [draftFilters],
  );

  const results = useMemo(
    () => filterCarRentalResults(CAR_RENTAL_RESULTS, appliedFilters, searchQuery),
    [appliedFilters, searchQuery],
  );

  const updateDraftFilter = <K extends keyof CarRentalFilterState>(
    key: K,
    value: CarRentalFilterState[K],
  ) => {
    setDraftFilters((current) => ({ ...current, [key]: value }));
  };

  const applyFilters = () => {
    setAppliedFilters(draftFilters);
  };

  const resetFilters = () => {
    setDraftFilters(DEFAULT_CAR_RENTAL_FILTERS);
    setAppliedFilters(DEFAULT_CAR_RENTAL_FILTERS);
    setSearchQuery("");
    router.replace(getClearedResultsHref("car-rentals", pathname), {
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
