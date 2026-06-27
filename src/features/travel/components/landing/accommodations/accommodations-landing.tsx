import { FEATURED_PROPERTIES } from "@/features/travel/data/property-listings";
import { BrowsePropertyTypeSection } from "./browse-property-type-section";
import { ExperiencePromoSection } from "./experience-promo-section";
import { FavouriteDestinationsSection } from "./favourite-destinations-section";
import { OngoingDealsSection } from "./ongoing-deals-section";
import { PropertyListingSection } from "../property-listing-section";
import { ACCOMMODATION_DEALS } from "@/features/travel/data/accommodations-landing";

export function AccommodationsLanding() {
  return (
    <div>
      <OngoingDealsSection items={ACCOMMODATION_DEALS} />
      <BrowsePropertyTypeSection />
      <PropertyListingSection
        titleKey="landing.ongoingDeals.title"
        descriptionKey="landing.ongoingDeals.description"
        items={FEATURED_PROPERTIES}
      />
      <ExperiencePromoSection />
      <PropertyListingSection
        titleKey="landing.bestDealsApartments.title"
        descriptionKey="landing.ongoingDeals.description"
        items={FEATURED_PROPERTIES}
      />
      <FavouriteDestinationsSection />
    </div>
  );
}
