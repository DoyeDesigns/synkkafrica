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
      <OngoingDealsSection
        title="Ongoing Deals"
        description="Promotions, deals, and special offers for you"
        items={ACCOMMODATION_DEALS}
      />
      <BrowsePropertyTypeSection />
      <PropertyListingSection
        title="Ongoing Deals"
        description="Promotions, deals, and special offers for you"
        items={FEATURED_PROPERTIES}
      />
      <ExperiencePromoSection />
      <PropertyListingSection
        title="Best deals on apartments"
        description="Promotions, deals, and special offers for you"
        items={FEATURED_PROPERTIES}
      />
      <FavouriteDestinationsSection />
    </div>
  );
}
