import { FlightAvailabilityPromo } from "@/features/travel/components/landing/shared/flight-availability-promo";

export function ToursFlightPromoSection() {
  return (
    <section className="w-full">
      <div className="mx-auto max-w-7xl px-4 py-15 sm:px-6 lg:px-8">
        <FlightAvailabilityPromo />
      </div>
    </section>
  );
}
