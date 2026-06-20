"use client";

import { createContext, useContext, type ReactNode } from "react";

import { useAccommodationFilters } from "@/features/travel/hooks/use-accommodation-filters";

type AccommodationFiltersContextValue = ReturnType<typeof useAccommodationFilters>;

const AccommodationFiltersContext =
  createContext<AccommodationFiltersContextValue | null>(null);

export function AccommodationFiltersProvider({ children }: { children: ReactNode }) {
  const value = useAccommodationFilters();

  return (
    <AccommodationFiltersContext.Provider value={value}>
      {children}
    </AccommodationFiltersContext.Provider>
  );
}

export function useAccommodationFiltersContext() {
  const context = useContext(AccommodationFiltersContext);

  if (!context) {
    throw new Error(
      "useAccommodationFiltersContext must be used within AccommodationFiltersProvider",
    );
  }

  return context;
}
