import type { TranslationKey } from "@/lib/preferences/translations";

/** Maps English content strings (from API/mock data) to translation keys. */
export const BOOKING_CONTENT_KEY_MAP: Record<string, TranslationKey> = {
  // Property descriptions (ark-havn)
  "Located in the heart of Marrakesh, The Ark Haven offers a serene escape with a blend of modern comfort and traditional Moroccan charm. Enjoy the outdoor pool, on-site bar, and air-conditioned rooms with flat-screen TVs.":
    "booking.content.property.arkHavn.desc0",
  "Guests can explore nearby attractions, enjoy shuttle services, tennis courts, and car hire. Whether you're here for leisure or business, The Ark Haven provides a memorable stay with exceptional hospitality.":
    "booking.content.property.arkHavn.desc1",

  // Offers
  "Buy 1 drink get one free": "booking.content.offer.drinkPromo",
  "10% Off Meals": "booking.content.offer.mealsOff",
  "Free Wifi": "booking.content.offer.freeWifi",

  // Rooms
  "Deluxe Suite": "booking.content.room.deluxeSuite",
  "Supreme Room": "booking.content.room.supremeRoom",
  "Standard Room": "booking.content.room.standardRoom",
  "Deluxe (1 Bedroom Apartment)": "booking.content.room.subtitle.deluxe",
  "Supreme (Studio Apartment)": "booking.content.room.subtitle.supreme",
  "Standard (Double Room)": "booking.content.room.subtitle.standard",
  "592 sq feet": "booking.content.room.size592",
  "420 sq feet": "booking.content.room.size420",
  "310 sq feet": "booking.content.room.size310",
  "Sleeps 2 Adults": "booking.content.room.sleeps2Adults",

  // Car packages
  "Daily hire": "booking.content.package.dailyHire",
  "Half-day hire": "booking.content.package.halfDayHire",
  "Extra hours": "booking.content.package.extraHours",
  "24 hours": "booking.content.package.hours24",
  "12 hours": "booking.content.package.hours12",
  "3 hours": "booking.content.package.hours3",

  // Car / tour features
  Automatic: "booking.content.feature.automatic",
  "Driver available": "booking.content.feature.driverAvailable",
  "Self drive": "booking.content.feature.selfDrive",
  Available: "booking.content.feature.available",
  "Limited slots": "booking.content.feature.limitedSlots",
  "Guided tour": "booking.content.feature.guidedTour",
  "Self-drive available": "booking.content.feature.selfDriveAvailable",
  "Flights included": "booking.content.feature.flightsIncluded",
  "Hotel stay": "booking.content.feature.hotelStay",
  "Guided tours": "booking.content.feature.guidedTours",

  // Tour options
  "Standard ticket": "booking.content.tourOption.standard",
  "Premium experience": "booking.content.tourOption.premium",
  "Private group": "booking.content.tourOption.private",
  "5 hours": "booking.content.tourOption.hours5",
  "Full day": "booking.content.tourOption.fullDay",

  // Tour package tiers
  "Standard package": "booking.content.tier.standard",
  "Deluxe package": "booking.content.tier.deluxe",
  "All-inclusive": "booking.content.tier.allInclusive",

  // Amenity categories
  "Great for your stay": "booking.content.amenityCat.greatForStay",
  Outdoors: "booking.content.amenityCat.outdoors",
  Pets: "booking.content.amenityCat.pets",
  Internet: "booking.content.amenityCat.internet",
  "On-site parking": "booking.content.amenityCat.onSiteParking",
  "Front Desk Services": "booking.content.amenityCat.frontDesk",
  "Entertainment & Family Services": "booking.content.amenityCat.familyServices",
  "Cleaning Services": "booking.content.amenityCat.cleaningServices",
  General: "booking.content.amenityCat.general",
  Accessibility: "booking.content.amenityCat.accessibility",
  "2 swimming pools": "booking.content.amenityCat.swimmingPools",
  "Pool 1 – outdoor": "booking.content.amenityCat.pool1Outdoor",

  // Amenity descriptions
  "Pets are allowed on request. No extra charges.":
    "booking.content.amenityDesc.petsAllowed",
  "Wifi is available in all areas and is free of charge.":
    "booking.content.amenityDesc.wifiFree",
  "Free public parking is available on site (reservation is not needed).":
    "booking.content.amenityDesc.parkingFree",

  // Amenity items
  Restaurant: "booking.content.amenityItem.restaurant",
  Parking: "booking.content.amenityItem.parking",
  Spa: "booking.content.amenityItem.spa",
  "Family rooms": "booking.content.amenityItem.familyRooms",
  "Room service": "booking.content.amenityItem.roomService",
  "Airport shuttle": "booking.content.amenityItem.airportShuttle",
  "BBQ facilities": "booking.content.amenityItem.bbqFacilities",
  "Pet friendly": "booking.content.amenityItem.petFriendly",
  "Non-smoking rooms": "booking.content.amenityItem.nonSmokingRooms",
  "Outdoor fireplace": "booking.content.amenityItem.outdoorFireplace",
  Beachfront: "booking.content.amenityItem.beachfront",
  "Sun deck": "booking.content.amenityItem.sunDeck",
  "Private beach area": "booking.content.amenityItem.privateBeach",
  Terrace: "booking.content.amenityItem.terrace",
  Garden: "booking.content.amenityItem.garden",
  "Valet parking": "booking.content.amenityItem.valetParking",
  "Parking garage": "booking.content.amenityItem.parkingGarage",
  "Accessible parking": "booking.content.amenityItem.accessibleParking",
  Lockers: "booking.content.amenityItem.lockers",
  Concierge: "booking.content.amenityItem.concierge",
  "ATM on site": "booking.content.amenityItem.atmOnSite",
  "Baggage storage": "booking.content.amenityItem.baggageStorage",
  "Currency exchange": "booking.content.amenityItem.currencyExchange",
  "24-hour front desk": "booking.content.amenityItem.frontDesk24h",
  "Outdoor play equipment for kids":
    "booking.content.amenityItem.outdoorPlayEquipment",
  "Daily housekeeping": "booking.content.amenityItem.dailyHousekeeping",
  "Ironing service": "booking.content.amenityItem.ironingService",
  "Shuttle service": "booking.content.amenityItem.shuttleService",
  "Shared lounge/TV area": "booking.content.amenityItem.sharedLounge",
  "Air conditioning": "booking.content.amenityItem.airConditioning",
  "Car rental": "booking.content.amenityItem.carRental",
  "Packed lunches": "booking.content.amenityItem.packedLunches",
  "Facilities for disabled guests":
    "booking.content.amenityItem.disabledFacilities",
  "Bathroom emergency cord": "booking.content.amenityItem.bathroomEmergencyCord",
  "Open all year": "booking.content.amenityItem.openAllYear",
  "Adults only": "booking.content.amenityItem.adultsOnly",
  "Pool/Beach towels": "booking.content.amenityItem.poolBeachTowels",
  "Pool bar": "booking.content.amenityItem.poolBar",
  "Beach chairs/Loungers": "booking.content.amenityItem.beachChairs",

  // Tour descriptions
  "Accessible only by boat or water taxi. It is famous for its relatively calm waters.":
    "booking.content.tour.desc.boatAccess",
  "Walk the longest canopy bridge in Africa and explore lush mangrove trails.":
    "booking.content.tour.desc.lekkiCanopy",
  "Discover one of the largest collections of contemporary African art in West Africa.":
    "booking.content.tour.desc.nikeArt",
  "Trace the history of the transatlantic slave trade through museums and landmarks.":
    "booking.content.tour.desc.badagry",
  "Dune bashing, camel rides, and a traditional Bedouin camp under the stars.":
    "booking.content.tour.desc.desertSafari",
  "Explore markets, colonial architecture, and the vibrant coastline of Benin.":
    "booking.content.tour.desc.cotonou",
  "Visit Stellenbosch vineyards with tastings and scenic mountain views.":
    "booking.content.tour.desc.winelands",
  "Sail the French Riviera coastline with views of Monte Carlo and luxury harbours.":
    "booking.content.tour.desc.monacoYacht",
  "Sample suya, puff-puff, and local delicacies across the city's best food spots.":
    "booking.content.tour.desc.lagosFood",
  "Paddle through the marina at sunset with skyline views and guided instruction.":
    "booking.content.tour.desc.dubaiKayak",
};

export const REVIEW_TEXT_KEYS: Record<string, TranslationKey> = {
  "review-1": "booking.content.review.review1",
  "review-2": "booking.content.review.review2",
  "review-3": "booking.content.review.review3",
};

export const BOOKING_CONTENT_TRANSLATION_KEYS = new Set<string>([
  "booking.content.property.fallback.desc0",
  "booking.content.property.fallback.desc1",
  "booking.content.property.arkHavn.desc0",
  "booking.content.property.arkHavn.desc1",
  ...Object.values(BOOKING_CONTENT_KEY_MAP),
  ...Object.values(REVIEW_TEXT_KEYS),
]);

export function isBookingContentKey(
  value: string,
): value is TranslationKey {
  return BOOKING_CONTENT_TRANSLATION_KEYS.has(value);
}
