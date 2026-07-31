import { apiFetch } from "@/lib/api/backend";
import type { CarRentalResult } from "@/features/travel/data/car-rental-results";
import type { CarDetail } from "@/features/travel/data/car-booking";

export type CarPackageApi = {
  id: string;
  name: string;
  hours: string;
  price: number;
};

export type CarSummaryApi = {
  id: string;
  name: string;
  location: string | null;
  coverImageUrl: string | null;
  images: string[];
  ratingAvg: number;
  ratingCount: number;
  currency: string;
  pricePerDay: number;
  transmission: string | null;
  comesWithDriver: boolean;
  carModel: string | null;
  year: string | null;
  features: string[];
};

export type CarDetailApi = CarSummaryApi & {
  description: string | null;
  pickupAddress: string | null;
  driverAddonPrice: number | null;
  deliveryFee: number | null;
  packages: CarPackageApi[];
};

export type BookCarInput = {
  packageId?: string;
  pickupDate: string; // YYYY-MM-DD
  dropoffDate: string; // YYYY-MM-DD
  driverRequested?: boolean;
  delivery?: boolean;
  guestFirstName?: string;
  specialRequests?: string;
};

export type CarBookingResult = {
  bookingId: string;
  bookingReference: string;
  amount: number;
  currency: string;
  days: number;
  status: string;
};

const FALLBACK_CAR_IMAGE = "/car-rental-landing.png";

export async function listCars(): Promise<CarSummaryApi[]> {
  return apiFetch<CarSummaryApi[]>("/cars");
}

export async function getCar(id: string): Promise<CarDetailApi> {
  return apiFetch<CarDetailApi>(`/cars/${id}`);
}

export async function bookCar(
  id: string,
  input: BookCarInput,
  token?: string,
): Promise<CarBookingResult> {
  return apiFetch<CarBookingResult>(`/cars/${id}/book`, {
    method: "POST",
    token,
    body: input,
  });
}

export async function initCarPayment(
  bookingId: string,
  input: { email?: string; callbackUrl?: string },
  token?: string,
): Promise<{ authorizationUrl: string; reference: string }> {
  return apiFetch(`/cars/bookings/${bookingId}/pay`, {
    method: "POST",
    token,
    body: input,
  });
}

export async function getCarPaymentStatus(
  bookingId: string,
  token?: string,
): Promise<{ paymentSecured: boolean; status: string }> {
  return apiFetch(`/cars/bookings/${bookingId}/payment-status`, { token });
}

// Map a backend summary onto the results-card shape.
export function toCarRentalResult(c: CarSummaryApi): CarRentalResult {
  return {
    id: c.id,
    name: c.name,
    location: c.location ?? "",
    rating: c.ratingAvg,
    reviewCount: c.ratingCount,
    pricePerDay: c.pricePerDay,
    currency: c.currency,
    image: c.coverImageUrl ?? c.images[0] ?? FALLBACK_CAR_IMAGE,
    carType: "",
    serviceType: c.comesWithDriver ? "With driver" : "Self drive",
    transmission: c.transmission ?? "",
    selfDriveAvailable: !c.comesWithDriver,
    hasDiscount: false,
  };
}

// Map a backend detail onto the rich CarDetail the booking flow renders.
export function toCarDetail(c: CarDetailApi): CarDetail {
  const cover = c.coverImageUrl ?? c.images[0] ?? FALLBACK_CAR_IMAGE;
  return {
    id: c.id,
    name: c.name,
    location: c.location ?? "",
    country: "",
    rating: c.ratingAvg,
    reviewCount: c.ratingCount,
    images: c.images.length ? c.images : [cover],
    features: c.features,
    packages: c.packages.length
      ? c.packages
      : [{ id: "daily", name: "Daily hire", hours: "24 hours", price: c.pricePerDay }],
    taxesAndFees: 0,
    currency: c.currency,
    pickupAddress: c.pickupAddress ?? undefined,
    driverAddonPrice: c.driverAddonPrice ?? undefined,
    deliveryFee: c.deliveryFee ?? undefined,
  };
}
