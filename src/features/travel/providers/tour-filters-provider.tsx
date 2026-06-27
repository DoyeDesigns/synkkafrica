"use client";

import { createContext, useContext, type ReactNode } from "react";

import { useTourFilters } from "@/features/travel/hooks/use-tour-filters";

type TourFiltersContextValue = ReturnType<typeof useTourFilters>;

const TourFiltersContext = createContext<TourFiltersContextValue | null>(null);

export function TourFiltersProvider({ children }: { children: ReactNode }) {
  const value = useTourFilters();

  return (
    <TourFiltersContext.Provider value={value}>
      {children}
    </TourFiltersContext.Provider>
  );
}

export function useTourFiltersContext() {
  const context = useContext(TourFiltersContext);

  if (!context) {
    throw new Error(
      "useTourFiltersContext must be used within TourFiltersProvider",
    );
  }

  return context;
}
