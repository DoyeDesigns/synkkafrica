"use client";

import { createContext, useContext, type ReactNode } from "react";

import { useCarRentalFilters } from "@/features/travel/hooks/use-car-rental-filters";

type CarRentalFiltersContextValue = ReturnType<typeof useCarRentalFilters>;

const CarRentalFiltersContext =
  createContext<CarRentalFiltersContextValue | null>(null);

export function CarRentalFiltersProvider({ children }: { children: ReactNode }) {
  const value = useCarRentalFilters();

  return (
    <CarRentalFiltersContext.Provider value={value}>
      {children}
    </CarRentalFiltersContext.Provider>
  );
}

export function useCarRentalFiltersContext() {
  const context = useContext(CarRentalFiltersContext);

  if (!context) {
    throw new Error(
      "useCarRentalFiltersContext must be used within CarRentalFiltersProvider",
    );
  }

  return context;
}
