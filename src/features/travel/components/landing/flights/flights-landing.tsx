import { FavouriteDestinationsSection } from "@/features/travel/components/landing/accommodations/favourite-destinations-section";
import { AirlinePartnersSection } from "./airline-partners-section";
import { CheapFlightsSection } from "./cheap-flights-section";
import { FlightDealsSection } from "./flight-deals-section";

export function FlightsLanding() {
  return (
    <div className="space-y-12">
      <FlightDealsSection seeMoreHref="/flights/deals" />
      <FavouriteDestinationsSection />
      <AirlinePartnersSection />
      <CheapFlightsSection />
    </div>
  );
}
