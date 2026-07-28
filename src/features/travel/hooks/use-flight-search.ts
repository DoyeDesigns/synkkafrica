"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import {
  searchFlights,
  type CabinClass,
  type FlightSearchInput,
} from "@/lib/api/flights";

const CABIN_MAP: Record<string, CabinClass> = {
  economy: "ECONOMY",
  premium_economy: "PREMIUM_ECONOMY",
  "premium-economy": "PREMIUM_ECONOMY",
  business: "BUSINESS",
  first: "FIRST",
};

const IATA = /^[A-Za-z]{3}$/;

// Reads the flight-search parameters the hero form wrote into the URL and,
// when they form a valid query, calls the backend GET /flights/search.
export function useFlightSearch() {
  const searchParams = useSearchParams();

  const origin = (searchParams.get("from") ?? "").trim().toUpperCase();
  const destination = (searchParams.get("to") ?? "").trim().toUpperCase();
  const departureDate = (searchParams.get("departureDate") ?? "").trim();
  const returnDate = (searchParams.get("returnDate") ?? "").trim();
  const tripType = searchParams.get("tripType") ?? "round-trip";
  const passengers = Number.parseInt(
    searchParams.get("passengers") ?? "1",
    10,
  );
  const cabinRaw = (searchParams.get("cabinClass") ?? "economy").toLowerCase();

  const input: FlightSearchInput = {
    origin,
    destination,
    departureDate,
    returnDate: tripType === "one-way" ? undefined : returnDate || undefined,
    adults: Number.isFinite(passengers) && passengers > 0 ? passengers : 1,
    cabin: CABIN_MAP[cabinRaw] ?? "ECONOMY",
    nonStop: tripType === "direct" ? true : undefined,
    take: 30,
  };

  const isValid =
    IATA.test(origin) && IATA.test(destination) && Boolean(departureDate);

  const query = useQuery({
    queryKey: ["flights", "search", input],
    queryFn: ({ signal }) => searchFlights(input, signal),
    enabled: isValid,
    staleTime: 2 * 60 * 1000, // match the backend's 15-min cache generously
    retry: 1,
  });

  return { ...query, input, isValid };
}
