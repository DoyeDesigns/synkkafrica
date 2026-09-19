export type TravelSection =
  | "accommodations"
  | "flights"
  | "car-rentals"
  | "tours";

export type TravelView = "landing" | "results";

export type TravelSectionConfig = {
  id: TravelSection;
  label: string;
  headline: string;
  heroImage: string;
  landingBlurb: string;
  resultsBlurb: string;
};

export type AccommodationsSearchParams = {
  propertyType?: string;
  rooms?: string;
  guests?: string;
  destination?: string;
  checkIn?: string;
  checkOut?: string;
};

export type FlightsSearchParams = {
  tripType?: "round-trip" | "one-way" | "direct";
  cabinClass?: string;
  passengers?: string;
  from?: string;
  to?: string;
  departureDate?: string;
  returnDate?: string;
};

export type CarRentalsSearchParams = {
  rentalMode?: "pickup-dropoff" | "daily-rental";
  locationKind?: "pickup" | "dropoff";
  location?: string;
  dropoffLocation?: string;
  serviceType?: string;
  date?: string;
  carType?: string;
  maxPrice?: string;
};

export type ToursSearchParams = {
  query?: string;
  location?: string;
  date?: string;
};

export type SectionSearchParams =
  | AccommodationsSearchParams
  | FlightsSearchParams
  | CarRentalsSearchParams
  | ToursSearchParams;
