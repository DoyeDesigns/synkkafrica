import { apiFetch } from "@/lib/api/backend";
import type { AccommodationResult } from "@/features/travel/data/accommodation-results";
import type { PropertyDetail } from "@/features/travel/data/property-booking";
import { DEFAULT_PROPERTY_AMENITIES } from "@/features/travel/data/property-amenities";

// Mirrors the backend AccommodationSummary / AccommodationDetail (public,
// live-only vendor accommodation listings).

export type AccommodationSummaryApi = {
  id: string;
  title: string;
  location: string | null;
  coverImageUrl: string | null;
  images: string[];
  ratingAvg: number;
  ratingCount: number;
  currency: string;
  pricePerNight: number;
  propertyType: string | null;
  maxGuests: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  amenities: string[];
};

export type AccommodationRoomApi = {
  id: string;
  name: string;
  description: string;
  maxGuests: number;
  pricePerNight: number;
};

export type AccommodationDetailApi = AccommodationSummaryApi & {
  description: string | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  rooms: AccommodationRoomApi[];
};

export type BookAccommodationInput = {
  roomId?: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  guests: number;
  roomCount: number;
  guestFirstName?: string;
  specialRequests?: string;
};

export type AccommodationBookingResult = {
  bookingId: string;
  bookingReference: string;
  amount: number;
  currency: string;
  nights: number;
  status: string;
};

export async function listAccommodations(): Promise<AccommodationSummaryApi[]> {
  return apiFetch<AccommodationSummaryApi[]>("/accommodations");
}

// Create a booking request. Auth is optional — a logged-in customer's token
// links the booking to their account; guests can still book.
export async function bookAccommodation(
  id: string,
  input: BookAccommodationInput,
  token?: string,
): Promise<AccommodationBookingResult> {
  return apiFetch<AccommodationBookingResult>(`/accommodations/${id}/book`, {
    method: "POST",
    token,
    body: input,
  });
}

export async function getAccommodation(
  id: string,
): Promise<AccommodationDetailApi> {
  return apiFetch<AccommodationDetailApi>(`/accommodations/${id}`);
}

const FALLBACK_ACCOMMODATION_IMAGE = "/hero/accommodations.png";

function amenityIcon(a: string): AccommodationResult["features"][number]["icon"] {
  const s = a.toLowerCase();
  if (s.includes("wifi") || s.includes("internet")) return "wifi";
  if (s.includes("breakfast") || s.includes("coffee")) return "coffee";
  if (s.includes("park") || s.includes("car")) return "car";
  return "bed";
}

// Map a backend summary onto the display shape the results card expects.
export function toAccommodationResult(
  a: AccommodationSummaryApi,
): AccommodationResult {
  return {
    id: a.id,
    name: a.title,
    location: a.location ?? "",
    rating: a.ratingAvg,
    reviewCount: a.ratingCount,
    price: a.pricePerNight,
    originalPrice: a.pricePerNight,
    currency: a.currency,
    image: a.coverImageUrl ?? a.images[0] ?? FALLBACK_ACCOMMODATION_IMAGE,
    features: a.amenities
      .slice(0, 4)
      .map((label) => ({ icon: amenityIcon(label), label })),
    propertyType: a.propertyType ?? "",
  };
}

// Map a backend detail onto the rich PropertyDetail the booking flow renders.
// Fields the vendor doesn't capture (reviews, map, taxes) get safe defaults.
export function toPropertyDetail(a: AccommodationDetailApi): PropertyDetail {
  const cover = a.coverImageUrl ?? a.images[0] ?? FALLBACK_ACCOMMODATION_IMAGE;
  const images = a.images.length ? a.images : [cover];
  const rooms =
    a.rooms.length > 0
      ? a.rooms.map((r) => ({
          id: r.id,
          name: r.name,
          subtitle: r.description,
          size: "",
          sleeps: `${r.maxGuests} guests`,
          guestCount: r.maxGuests || 2,
          pricePerNight: r.pricePerNight,
          image: cover,
        }))
      : [
          {
            id: "standard",
            name: "Standard room",
            subtitle: "",
            size: "",
            sleeps: `${a.maxGuests ?? 2} guests`,
            guestCount: a.maxGuests ?? 2,
            pricePerNight: a.pricePerNight,
            image: cover,
          },
        ];

  return {
    id: a.id,
    name: a.title,
    location: a.location ?? "",
    country: "",
    rating: a.ratingAvg,
    reviewCount: a.ratingCount,
    description: a.description ? [a.description] : [],
    images,
    extraPhotoCount: Math.max(0, images.length - 5),
    mapCoordinates: [0, 0],
    rooms,
    reviews: [],
    offers: [],
    amenities: DEFAULT_PROPERTY_AMENITIES,
    taxesAndFees: 0,
    currency: a.currency,
  };
}
