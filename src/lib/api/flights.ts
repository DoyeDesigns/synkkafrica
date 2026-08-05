import { apiFetch } from "@/lib/api/backend";

// Mirrors the backend's FlightOfferDto (src/flights/dto/flight-offer.dto.ts).
export type FlightSegment = {
  carrierCode: string;
  carrierName?: string;
  carrierLogoUrl?: string | null;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureAt: string; // ISO 8601
  arrivalAt: string; // ISO 8601
  durationIso?: string; // ISO 8601 duration, e.g. PT6H30M
};

export type FlightItinerary = {
  segments: FlightSegment[];
};

export type FlightOffer = {
  id: string;
  itineraries: FlightItinerary[];
  totalPrice: string;
  currency: string;
  oneWay: boolean;
  expiresAt: string;
  holdAvailable: boolean;
  paymentRequiredBy: string | null;
  priceGuaranteeExpiresAt: string | null;
};

export type FlightSearchResponse = {
  items: FlightOffer[];
  total: number;
  skip: number;
  take: number;
};

export type CabinClass = "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST";

export type FlightSearchInput = {
  origin: string; // IATA, e.g. "LOS"
  destination: string; // IATA
  departureDate: string; // YYYY-MM-DD
  returnDate?: string;
  adults: number;
  cabin?: CabinClass;
  nonStop?: boolean;
  skip?: number;
  take?: number;
};

export type FlightPriceResponse = { offer: FlightOffer; expiresAt?: string };

// Re-prices / fetches a single offer by id (POST /flights/price). Used to show
// a live summary on the booking page. 404 if the offer expired.
export async function priceOffer(
  offerId: string,
  signal?: AbortSignal,
): Promise<FlightPriceResponse> {
  return apiFetch<FlightPriceResponse>("/flights/price", {
    method: "POST",
    body: { offerId },
    signal,
  });
}

// --- Popular fares (curated "cheap flights" landing section) ---

export type PopularFare = {
  origin: string;
  destination: string;
  city: string;
  region: string;
  price: string | null;
  currency: string | null;
};

export type PopularFaresResponse = {
  fares: PopularFare[];
  sampledDate: string;
  refreshedAt: string;
};

// Pre-computed, server-cached cheapest fares. One call powers the whole
export type FlightPlace = {
  id: string;
  type: "airport" | "city";
  name: string;
  iataCode: string;
  cityName: string | null;
};

// Airport/city autocomplete for the flight origin & destination fields
// (backed by Duffel Places). Returns real IATA codes.
export async function suggestFlightPlaces(
  query: string,
  signal?: AbortSignal,
): Promise<FlightPlace[]> {
  return apiFetch<FlightPlace[]>("/flights/places", {
    method: "GET",
    query: { query },
    signal,
  });
}

// "Cheap flights from Nigeria" section — no per-route live searches.
export async function getPopularFares(
  signal?: AbortSignal,
): Promise<PopularFaresResponse> {
  return apiFetch<PopularFaresResponse>("/flights/popular-fares", { signal });
}

// Calls the backend's public GET /flights/search. No auth token required.
export async function searchFlights(
  input: FlightSearchInput,
  signal?: AbortSignal,
): Promise<FlightSearchResponse> {
  return apiFetch<FlightSearchResponse>("/flights/search", {
    method: "GET",
    query: {
      origin: input.origin,
      destination: input.destination,
      departureDate: input.departureDate,
      returnDate: input.returnDate,
      adults: input.adults,
      cabin: input.cabin,
      nonStop: input.nonStop,
      skip: input.skip,
      take: input.take,
    },
    signal,
  });
}
