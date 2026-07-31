"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { getClearedResultsHref } from "@/features/travel/booking/clear-results-url";
import {
  CAR_TYPE_OPTIONS,
  DEFAULT_CAR_RENTAL_FILTERS,
  SERVICE_TYPE_OPTIONS,
  countActiveCarRentalFilters,
  filterCarRentalResults,
  type CarRentalFilterState,
} from "@/features/travel/data/car-rental-results";
import { listCars, toCarRentalResult } from "@/lib/api/cars";

function normalizeServiceType(value: string): string {
  const normalized = value.toLowerCase().replace(/-/g, " ");

  if (normalized === "self drive") {
    return "Self drive";
  }

  if (normalized === "chauffeur") {
    return "Chauffeur";
  }

  if ((SERVICE_TYPE_OPTIONS as readonly string[]).includes(value)) {
    return value;
  }

  return DEFAULT_CAR_RENTAL_FILTERS.serviceType;
}

function hasCarRentalSearchParams(searchParams: URLSearchParams) {
  return ["carType", "location", "serviceType", "maxPrice", "date"].some((key) =>
    searchParams.get(key),
  );
}

function getFiltersFromSearchParams(
  searchParams: URLSearchParams,
): CarRentalFilterState {
  if (!hasCarRentalSearchParams(searchParams)) {
    return DEFAULT_CAR_RENTAL_FILTERS;
  }

  const filters: CarRentalFilterState = {
    ...DEFAULT_CAR_RENTAL_FILTERS,
  };

  const location = searchParams.get("location");
  if (location) {
    filters.location = location;
  }

  const serviceType = searchParams.get("serviceType");
  if (serviceType) {
    filters.serviceType = normalizeServiceType(serviceType);
  }

  const maxPrice = searchParams.get("maxPrice");
  if (maxPrice) {
    const parsed = Number.parseInt(maxPrice, 10);

    if (!Number.isNaN(parsed)) {
      filters.priceMax = parsed;
    }
  }

  const carType = searchParams.get("carType");
  if (carType && (CAR_TYPE_OPTIONS as readonly string[]).includes(carType)) {
    filters.carType = carType;
  }

  return filters;
}

export function useCarRentalFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [draftFilters, setDraftFilters] = useState<CarRentalFilterState>(() =>
    getFiltersFromSearchParams(searchParams),
  );
  const [appliedFilters, setAppliedFilters] = useState<CarRentalFilterState>(() =>
    getFiltersFromSearchParams(searchParams),
  );
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("carType") ?? "",
  );

  // Re-sync editable state on URL change via React's adjust-state-during-render
  // pattern (no setState-in-effect).
  const searchKey = searchParams.toString();
  const [prevSearchKey, setPrevSearchKey] = useState(searchKey);
  if (searchKey !== prevSearchKey) {
    setPrevSearchKey(searchKey);
    const nextFilters = getFiltersFromSearchParams(searchParams);
    setDraftFilters(nextFilters);
    setAppliedFilters(nextFilters);
    setSearchQuery(searchParams.get("carType") ?? "");
  }

  const activeFilterCount = useMemo(
    () => countActiveCarRentalFilters(appliedFilters),
    [appliedFilters],
  );

  const draftFilterCount = useMemo(
    () => countActiveCarRentalFilters(draftFilters),
    [draftFilters],
  );

  const { data: liveCars, isLoading } = useQuery({
    queryKey: ["cars"],
    queryFn: listCars,
    refetchOnWindowFocus: false,
  });

  const allResults = useMemo(
    () => (liveCars ?? []).map(toCarRentalResult),
    [liveCars],
  );

  const results = useMemo(
    () => filterCarRentalResults(allResults, appliedFilters, searchQuery),
    [allResults, appliedFilters, searchQuery],
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
