import { TOUR_EVENTS } from "@/features/travel/data/tours-landing";
import { TOUR_RESULTS } from "@/features/travel/data/tour-results";

export type TourExperienceOption = {
  id: string;
  name: string;
  duration: string;
  price: number;
};

export type TourDetail = {
  id: string;
  title: string;
  location: string;
  country: string;
  description: string;
  rating: number;
  reviewCount: number;
  images: string[];
  features: string[];
  options: TourExperienceOption[];
  taxesAndFees: number;
  currency: string;
  category: string;
  experienceType: string;
};

const DEFAULT_OPTIONS: TourExperienceOption[] = [
  { id: "standard", name: "Standard ticket", duration: "3 hours", price: 30500 },
  { id: "premium", name: "Premium experience", duration: "5 hours", price: 52000 },
  { id: "private", name: "Private group", duration: "Full day", price: 95000 },
];

function buildOptions(basePrice: number): TourExperienceOption[] {
  return [
    { id: "standard", name: "Standard ticket", duration: "3 hours", price: basePrice },
    {
      id: "premium",
      name: "Premium experience",
      duration: "5 hours",
      price: Math.round(basePrice * 1.6),
    },
    {
      id: "private",
      name: "Private group",
      duration: "Full day",
      price: Math.round(basePrice * 2.8),
    },
  ];
}

function buildFromEvent(event: (typeof TOUR_EVENTS)[number]): TourDetail {
  return {
    id: event.id,
    title: event.title,
    location: event.location,
    country: event.city,
    description: event.description,
    rating: event.rating,
    reviewCount: event.reviewCount,
    images: [event.image, event.image],
    features: [
      event.category,
      event.experience,
      event.available ? "Available" : "Limited slots",
      event.selfDriveAvailable ? "Self-drive available" : "Guided tour",
    ],
    options: buildOptions(event.price),
    taxesAndFees: 8500,
    currency: event.currency,
    category: event.category,
    experienceType: event.experience,
  };
}

function buildGenericFallback(tourId: string): TourDetail {
  const template = buildFromEvent(TOUR_EVENTS[0]);

  return {
    ...template,
    id: tourId,
    title: "Tarkwa Bay Tour",
  };
}

export function getTourById(tourId: string): TourDetail | null {
  const event =
    TOUR_EVENTS.find((item) => item.id === tourId) ??
    TOUR_RESULTS.find((item) => item.id === tourId);

  if (event) {
    return buildFromEvent(event);
  }

  return buildGenericFallback(tourId);
}

export function getAllTourIds(): string[] {
  const ids = new Set<string>([
    ...TOUR_EVENTS.map((item) => item.id),
    ...TOUR_RESULTS.map((item) => item.id),
  ]);

  return Array.from(ids);
}
