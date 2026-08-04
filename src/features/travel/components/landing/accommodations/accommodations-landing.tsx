"use client";

import { useQuery } from "@tanstack/react-query";

import { BrowsePropertyTypeSection } from "./browse-property-type-section";
import { ExperiencePromoSection } from "./experience-promo-section";
import { FavouriteDestinationsSection } from "./favourite-destinations-section";
import { OngoingDealsSection } from "./ongoing-deals-section";
import { PropertyListingSection } from "../property-listing-section";
import { ACCOMMODATION_DEALS } from "@/features/travel/data/accommodations-landing";
import {
  listAccommodations,
  toPropertyListingItem,
} from "@/lib/api/accommodations";

export function AccommodationsLanding() {
  // Shares the ["accommodations"] cache with the results page.
  const { data } = useQuery({
    queryKey: ["accommodations"],
    queryFn: listAccommodations,
    refetchOnWindowFocus: false,
  });
  const items = (data ?? []).map(toPropertyListingItem);
  const hasItems = items.length > 0;

  return (
    <div>
      <OngoingDealsSection items={ACCOMMODATION_DEALS} />
      <BrowsePropertyTypeSection />
      {hasItems ? (
        <PropertyListingSection
          titleKey="landing.fansFavourite.title"
          descriptionKey="landing.ongoingDeals.description"
          items={items}
        />
      ) : null}
      <ExperiencePromoSection />
      {hasItems ? (
        <PropertyListingSection
          titleKey="landing.bestDealsApartments.title"
          descriptionKey="landing.ongoingDeals.description"
          items={items}
        />
      ) : null}
      <FavouriteDestinationsSection />
    </div>
  );
}
