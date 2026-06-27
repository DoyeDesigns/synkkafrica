import { ACCOMMODATION_RESULTS } from "@/features/travel/data/accommodation-results";
import {
  DEFAULT_PROPERTY_AMENITIES,
  type PropertyAmenities,
} from "@/features/travel/data/property-amenities";

export type PropertyRoom = {
  id: string;
  name: string;
  subtitle: string;
  size: string;
  sleeps: string;
  guestCount: number;
  pricePerNight: number;
  image: string;
  includesTaxesInDisplay?: boolean;
};

export type PropertyReview = {
  id: string;
  author: string;
  avatarInitial: string;
  rating: number;
  text: string;
};

export type PropertyDetail = {
  id: string;
  name: string;
  location: string;
  country: string;
  rating: number;
  reviewCount: number;
  description: string[];
  images: string[];
  extraPhotoCount: number;
  mapCoordinates: [number, number];
  rooms: PropertyRoom[];
  reviews: PropertyReview[];
  offers: string[];
  amenities: PropertyAmenities;
  taxesAndFees: number;
  currency: string;
};

const PROPERTY_DETAILS: Record<string, PropertyDetail> = {
  "ark-havn-results": {
    id: "ark-havn-results",
    name: "The Ark Haven",
    location: "Marrakesh",
    country: "Morocco",
    rating: 4.6,
    reviewCount: 12,
    description: [
      "Located in the heart of Marrakesh, The Ark Haven offers a serene escape with a blend of modern comfort and traditional Moroccan charm. Enjoy the outdoor pool, on-site bar, and air-conditioned rooms with flat-screen TVs.",
      "Guests can explore nearby attractions, enjoy shuttle services, tennis courts, and car hire. Whether you're here for leisure or business, The Ark Haven provides a memorable stay with exceptional hospitality.",
    ],
    images: [
      "/hero/accommodations.png",
      "/hero/accommodations.png",
      "/hero/accommodations.png",
      "/hero/accommodations.png",
    ],
    extraPhotoCount: 3,
    mapCoordinates: [31.6295, -7.9811],
    currency: "NGN",
    taxesAndFees: 10000,
    rooms: [
      {
        id: "deluxe-suite",
        name: "Deluxe Suite",
        subtitle: "Deluxe (1 Bedroom Apartment)",
        size: "592 sq feet",
        sleeps: "Sleeps 2 Adults",
        guestCount: 3,
        pricePerNight: 300000,
        image: "/hero/accommodations.png",
        includesTaxesInDisplay: true,
      },
      {
        id: "supreme-room",
        name: "Supreme Room",
        subtitle: "Supreme (Studio Apartment)",
        size: "420 sq feet",
        sleeps: "Sleeps 2 Adults",
        guestCount: 3,
        pricePerNight: 180000,
        image: "/hero/accommodations.png",
      },
      {
        id: "standard-room",
        name: "Standard Room",
        subtitle: "Standard (Double Room)",
        size: "310 sq feet",
        sleeps: "Sleeps 2 Adults",
        guestCount: 2,
        pricePerNight: 90000,
        image: "/hero/accommodations.png",
      },
    ],
    reviews: [
      {
        id: "review-1",
        author: "Ben Ramsey",
        avatarInitial: "B",
        rating: 4.6,
        text: "The Ark Haven exceeded my expectations. The staff was incredibly welcoming, and the pool area was a perfect spot to relax after exploring the city.",
      },
      {
        id: "review-2",
        author: "Amina Okafor",
        avatarInitial: "A",
        rating: 4.8,
        text: "Beautiful rooms, great location, and the breakfast was outstanding. I would definitely stay here again on my next trip to Morocco.",
      },
      {
        id: "review-3",
        author: "James Okonkwo",
        avatarInitial: "J",
        rating: 4.5,
        text: "Spacious suite, clean facilities, and helpful concierge. The shuttle service made getting around Marrakesh very easy.",
      },
    ],
    offers: [
      "booking.content.offer.drinkPromo",
      "booking.content.offer.mealsOff",
      "booking.content.offer.freeWifi",
    ],
    amenities: DEFAULT_PROPERTY_AMENITIES,
  },
};

function buildFallbackProperty(resultId: string): PropertyDetail | null {
  const result = ACCOMMODATION_RESULTS.find((item) => item.id === resultId);
  if (!result) return null;

  return {
    id: result.id,
    name: result.name,
    location: result.location,
    country: result.location.split(",").pop()?.trim() ?? result.location,
    rating: result.rating,
    reviewCount: result.reviewCount,
    description: [
      "booking.content.property.fallback.desc0",
      "booking.content.property.fallback.desc1",
    ],
    images: [result.image, result.image, result.image, result.image],
    extraPhotoCount: 2,
    mapCoordinates: [6.5244, 3.3792],
    currency: result.currency,
    taxesAndFees: 10000,
    rooms: [
      {
        id: `${result.id}-deluxe`,
        name: "Deluxe Suite",
        subtitle: "Deluxe (1 Bedroom Apartment)",
        size: "592 sq feet",
        sleeps: "Sleeps 2 Adults",
        guestCount: 3,
        pricePerNight: Math.max(result.price, 300000),
        image: result.image,
        includesTaxesInDisplay: true,
      },
      {
        id: `${result.id}-supreme`,
        name: "Supreme Room",
        subtitle: "Supreme (Studio Apartment)",
        size: "420 sq feet",
        sleeps: "Sleeps 2 Adults",
        guestCount: 3,
        pricePerNight: Math.round(result.price * 1.25),
        image: result.image,
      },
      {
        id: `${result.id}-standard`,
        name: "Standard Room",
        subtitle: "Standard (Double Room)",
        size: "310 sq feet",
        sleeps: "Sleeps 2 Adults",
        guestCount: 2,
        pricePerNight: Math.round(result.price * 0.65),
        image: result.image,
      },
    ],
    reviews: PROPERTY_DETAILS["ark-havn-results"].reviews,
    offers: PROPERTY_DETAILS["ark-havn-results"].offers,
    amenities: DEFAULT_PROPERTY_AMENITIES,
  };
}

function buildGenericFallback(propertyId: string): PropertyDetail {
  const template = PROPERTY_DETAILS["ark-havn-results"];

  return {
    ...template,
    id: propertyId,
    rooms: template.rooms.map((room) => ({
      ...room,
      id: `${propertyId}-${room.id}`,
    })),
  };
}

export function getPropertyById(propertyId: string): PropertyDetail | null {
  return (
    PROPERTY_DETAILS[propertyId] ??
    buildFallbackProperty(propertyId) ??
    buildGenericFallback(propertyId)
  );
}

export function getAllPropertyIds(): string[] {
  const ids = new Set<string>([
    ...Object.keys(PROPERTY_DETAILS),
    ...ACCOMMODATION_RESULTS.map((item) => item.id),
  ]);

  return Array.from(ids);
}
