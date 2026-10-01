import { apiFetch } from "@/lib/api/backend";
import type { TourResult } from "@/features/travel/data/tour-results";
import type { TourDetail } from "@/features/travel/data/tour-booking";
import type {
  InitBookingPaymentInput,
  InitBookingPaymentResult,
} from "@/lib/api/payments";

export type ExperienceOptionApi = {
  id: string;
  name: string;
  duration: string;
  price: number;
};

export type ExperienceSummaryApi = {
  id: string;
  title: string;
  location: string | null;
  coverImageUrl: string | null;
  images: string[];
  ratingAvg: number;
  ratingCount: number;
  currency: string;
  pricePerPerson: number;
  category: string | null;
  experienceType: string | null;
  features: string[];
};

export type ExperienceDetailApi = ExperienceSummaryApi & {
  description: string | null;
  duration: string | null;
  maxGuests: number | null;
  options: ExperienceOptionApi[];
  // SynkAfrica service fee rate charged once on the booking subtotal.
  feeRate?: number;
  latitude?: number | null;
  longitude?: number | null;
  lat?: number | null;
  lng?: number | null;
  lon?: number | null;
};

export type BookExperienceInput = {
  optionId?: string;
  date: string; // YYYY-MM-DD
  time?: string;
  guests: number;
  guestFirstName?: string;
  specialRequests?: string;
};

export type ExperienceBookingResult = {
  bookingId: string;
  bookingReference: string;
  amount: number;
  currency: string;
  status: string;
  // Authoritative price breakdown from the backend: `subtotal` is the
  // vendor's price (days/nights/guests/add-ons), `fees` the SynkAfrica
  // service fee charged once on it, `total` === `amount` is what is charged.
  subtotal: number;
  fees: number;
  feeRate: number;
  total: number;
};

const FALLBACK_TOUR_IMAGE = "/destinations/lagos.png";

export async function listExperiences(): Promise<ExperienceSummaryApi[]> {
  return apiFetch<ExperienceSummaryApi[]>("/experiences");
}

export type ExperienceDestination = { location: string; count: number };

// Distinct locations with live experiences (search autocomplete).
export async function listExperienceDestinations(): Promise<
  ExperienceDestination[]
> {
  return apiFetch<ExperienceDestination[]>("/experiences/destinations");
}

export async function getExperience(id: string): Promise<ExperienceDetailApi> {
  return apiFetch<ExperienceDetailApi>(`/experiences/${id}`);
}

export async function bookExperience(
  id: string,
  input: BookExperienceInput,
  token?: string,
): Promise<ExperienceBookingResult> {
  return apiFetch<ExperienceBookingResult>(`/experiences/${id}/book`, {
    method: "POST",
    token,
    body: input,
  });
}

export async function initExperiencePayment(
  bookingId: string,
  input: InitBookingPaymentInput,
  token?: string,
): Promise<InitBookingPaymentResult> {
  return apiFetch(`/experiences/bookings/${bookingId}/pay`, {
    method: "POST",
    token,
    body: input,
  });
}

export async function getExperiencePaymentStatus(
  bookingId: string,
  token?: string,
): Promise<{ paymentSecured: boolean; status: string }> {
  return apiFetch(`/experiences/bookings/${bookingId}/payment-status`, {
    token,
  });
}

// Gallery order: the vendor-chosen main image first, then the rest.
function coverFirst(cover: string | null, images: string[]): string[] {
  if (!cover) return images;
  return [cover, ...images.filter((url) => url !== cover)];
}

// Map a backend summary onto the tour results-card shape.
export function toTourResult(e: ExperienceSummaryApi): TourResult {
  return {
    id: e.id,
    title: e.title,
    description: e.features[0] ?? "",
    location: e.location ?? "",
    city: e.location ?? "",
    category: e.category ?? "",
    experience: e.experienceType ?? "",
    rating: e.ratingAvg,
    reviewCount: e.ratingCount,
    price: e.pricePerPerson,
    currency: e.currency,
    image: e.coverImageUrl ?? e.images[0] ?? FALLBACK_TOUR_IMAGE,
    available: true,
    selfDriveAvailable: false,
    hasDiscount: false,
  };
}

function coordsFromExperience(e: ExperienceDetailApi): [number, number] | null {
  const lat = e.latitude ?? e.lat;
  const lon = e.longitude ?? e.lng ?? e.lon;

  if (
    typeof lat === "number" &&
    typeof lon === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    (Math.abs(lat) > 0.001 || Math.abs(lon) > 0.001)
  ) {
    return [lat, lon];
  }

  return null;
}

// Map a backend detail onto the rich TourDetail the booking flow renders.
export function toTourDetail(e: ExperienceDetailApi): TourDetail {
  const cover = e.coverImageUrl ?? e.images[0] ?? FALLBACK_TOUR_IMAGE;
  return {
    id: e.id,
    title: e.title,
    location: e.location ?? "",
    country: "",
    description: e.description ?? "",
    rating: e.ratingAvg,
    reviewCount: e.ratingCount,
    images: e.images.length ? coverFirst(e.coverImageUrl, e.images) : [cover],
    features: e.features,
    options: e.options.length
      ? e.options
      : [
          {
            id: "standard",
            name: "Per person",
            duration: e.duration ?? "",
            price: e.pricePerPerson,
          },
        ],
    taxesAndFees: 0,
    currency: e.currency,
    category: e.category ?? "",
    experienceType: e.experienceType ?? "",
    feeRate: e.feeRate,
    mapCoordinates: coordsFromExperience(e) ?? [0, 0],
  };
}
