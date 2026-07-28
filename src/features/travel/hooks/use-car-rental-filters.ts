"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { getClearedResultsHref } from "@/features/travel/booking/clear-results-url";
import {
  CAR_RENTAL_RESULTS,
  CAR_TYPE_OPTIONS,
  DEFAULT_CAR_RENTAL_FILTERS,
  SERVICE_TYPE_OPTIONS,
  countActiveCarRentalFilters,
  filterCarRentalResults,
  type CarRentalFilterState,
} from "@/features/travel/data/car-rental-results";

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

  useEffect(() => {
    const nextFilters = getFiltersFromSearchParams(searchParams);
    setDraftFilters(nextFilters);
    setAppliedFilters(nextFilters);
    setSearchQuery(searchParams.get("carType") ?? "");
  }, [searchParams]);

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

  const hasAppliedFilters =
    activeFilterCount > 0 || searchQuery.trim().length > 0;

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
