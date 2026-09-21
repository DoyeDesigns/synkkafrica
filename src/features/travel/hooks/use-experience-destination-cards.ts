"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { FAVOURITE_DESTINATIONS } from "@/features/travel/data/accommodations-landing";
import { locationsOverlap } from "@/features/travel/data/location-match";
import {
  getTourAttractionFilterLocation,
  TOUR_ATTRACTIONS,
} from "@/features/travel/data/tours-landing";
import { listExperienceDestinations } from "@/lib/api/experiences";

export type ExperienceDestinationCard = {
  id?: string;
  location: string;
  filterLocation?: string;
  count: number;
  image: string;
};

function activityCountForPlace(
  placeName: string,
  filterLocation: string,
  destinations: { location: string; count: number }[],
) {
  return destinations.reduce((sum, destination) => {
    if (
      locationsOverlap(placeName, destination.location) ||
      locationsOverlap(filterLocation, destination.location)
    ) {
      return sum + destination.count;
    }
    return sum;
  }, 0);
}

function toPlaceCards(
  places: { id: string; name: string; image: string }[],
  destinations: { location: string; count: number }[],
): ExperienceDestinationCard[] {
  return places.map((place) => {
    const filterLocation = getTourAttractionFilterLocation(place.id);
    return {
      id: place.id,
      location: place.name,
      filterLocation,
      count: activityCountForPlace(place.name, filterLocation, destinations),
      image: place.image,
    };
  });
}

function useLiveExperienceDestinations() {
  return useQuery({
    queryKey: ["experience-destinations"],
    queryFn: listExperienceDestinations,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useExperienceDestinationCards() {
  const { data: destinations = [] } = useLiveExperienceDestinations();

  return useMemo(
    () => toPlaceCards(FAVOURITE_DESTINATIONS, destinations),
    [destinations],
  );
}

export function useAttractionPlaceCards() {
  const { data: destinations = [] } = useLiveExperienceDestinations();

  return useMemo(
    () => toPlaceCards(TOUR_ATTRACTIONS, destinations),
    [destinations],
  );
}
