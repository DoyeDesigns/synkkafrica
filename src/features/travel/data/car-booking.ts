import { CAR_RENTAL_RESULTS } from "@/features/travel/data/car-rental-results";

export type CarRentalPackage = {
  id: string;
  name: string;
  hours: string;
  price: number;
};

export type CarDetail = {
  id: string;
  name: string;
  location: string;
  country: string;
  rating: number;
  reviewCount: number;
  images: string[];
  features: string[];
  packages: CarRentalPackage[];
  taxesAndFees: number;
  currency: string;
};

const DEFAULT_PACKAGES: CarRentalPackage[] = [
  { id: "daily-hire", name: "Daily hire", hours: "24 hours", price: 100000 },
  { id: "half-day-hire", name: "Half-day hire", hours: "12 hours", price: 180000 },
  { id: "extra-hours", name: "Extra hours", hours: "3 hours", price: 30000 },
];

const CAR_DETAILS: Record<string, CarDetail> = {
  "highlander-lekki-1": {
    id: "highlander-lekki-1",
    name: "Toyota highlander 2024",
    location: "Lekki Phase 1",
    country: "Lagos, Nigeria",
    rating: 0,
    reviewCount: 0,
    images: ["/car-rental-landing.png", "/car-rental-landing.png"],
    features: ["Automatic", "Driver available", "Buy 1 drink get one free"],
    packages: DEFAULT_PACKAGES,
    taxesAndFees: 10000,
    currency: "NGN",
  },
};

function buildFallbackCar(carId: string): CarDetail | null {
  const result = CAR_RENTAL_RESULTS.find((item) => item.id === carId);
  if (!result) return null;

  return {
    id: result.id,
    name: result.name,
    location: result.location,
    country: "Lagos, Nigeria",
    rating: result.rating,
    reviewCount: result.reviewCount,
    images: [result.image, result.image],
    features: [
      result.transmission,
      result.serviceType === "Self drive" ? "Self drive" : "Driver available",
      "Buy 1 drink get one free",
    ],
    packages: [
      {
        id: "daily-hire",
        name: "Daily hire",
        hours: "24 hours",
        price: result.pricePerDay,
      },
      {
        id: "half-day-hire",
        name: "Half-day hire",
        hours: "12 hours",
        price: Math.round(result.pricePerDay * 0.65),
      },
      {
        id: "extra-hours",
        name: "Extra hours",
        hours: "3 hours",
        price: Math.round(result.pricePerDay * 0.2),
      },
    ],
    taxesAndFees: 10000,
    currency: result.currency,
  };
}

function buildGenericFallback(carId: string): CarDetail {
  const template = CAR_DETAILS["highlander-lekki-1"];

  return {
    ...template,
    id: carId,
    name: "Toyota highlander 2024",
  };
}

export function getCarById(carId: string): CarDetail | null {
  return (
    CAR_DETAILS[carId] ??
    buildFallbackCar(carId) ??
    buildGenericFallback(carId)
  );
}

export function getAllCarIds(): string[] {
  const ids = new Set<string>([
    ...Object.keys(CAR_DETAILS),
    ...CAR_RENTAL_RESULTS.map((item) => item.id),
  ]);

  return Array.from(ids);
}
