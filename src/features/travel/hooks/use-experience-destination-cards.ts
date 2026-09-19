"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { FAVOURITE_DESTINATIONS } from "@/features/travel/data/accommodations-landing";
import { listExperienceDestinations } from "@/lib/api/experiences";

export type ExperienceDestinationCard = {
  location: string;
  count: number;
  image: string;
};

function imageForLocation(location: string) {
  const hay = location.toLowerCase();
  const match = FAVOURITE_DESTINATIONS.find((item) => {
    const name = item.name.toLowerCase();
    const token = item.id.replace(/-/g, " ");
    const city = name.split(",")[0]?.trim() ?? name;
    return hay.includes(token) || hay.includes(city) || name.includes(hay);
  });

  return match?.image ?? "/destinations/lagos.png";
}

export function useExperienceDestinationCards() {
  const { data: destinations = [] } = useQuery({
    queryKey: ["experience-destinations"],
    queryFn: listExperienceDestinations,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return useMemo(
    () =>
      destinations
        .filter((destination) => destination.location.trim() && destination.count > 0)
        .map((destination) => ({
          location: destination.location,
          count: destination.count,
          image: imageForLocation(destination.location),
        })),
    [destinations],
  );
}
