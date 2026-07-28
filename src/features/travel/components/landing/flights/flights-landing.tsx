import { ACCOMMODATION_DEALS } from "@/features/travel/data/accommodations-landing";
import { FavouriteDestinationsSection } from "@/features/travel/components/landing/accommodations/favourite-destinations-section";
import { OngoingDealsSection } from "@/features/travel/components/landing/accommodations/ongoing-deals-section";
import { AirlinePartnersSection } from "./airline-partners-section";
import { CheapFlightsSection } from "./cheap-flights-section";

export function FlightsLanding() {
  return (
    <div className="space-y-12">
      <FavouriteDestinationsSection />
      <AirlinePartnersSection />
      <OngoingDealsSection
        items={ACCOMMODATION_DEALS}
        seeMoreHref="/?section=flights&view=results"
      />
      <CheapFlightsSection />
    </div>
  );
}
