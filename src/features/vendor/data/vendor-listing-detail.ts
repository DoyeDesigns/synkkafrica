import {
  EMPTY_ADD_LISTING_FORM,
  type AddListingFormState,
  type ListingMediaItem,
} from "@/features/vendor/data/vendor-add-listing";
import { VENDOR_BOOKINGS } from "@/features/vendor/data/vendor-bookings";
import {
  getVendorListingById,
  mapListingCategoryKey,
} from "@/features/vendor/data/vendor-listings";

function mediaFromImages(images: string[], baseName: string): ListingMediaItem[] {
  return images.map((previewUrl, index) => ({
    id: `${baseName}-${index + 1}`,
    name: `${baseName}-${index + 1}.jpg`,
    previewUrl,
    kind: "image" as const,
    url: previewUrl,
    status: "uploaded" as const,
  }));
}

function documentStub(name: string) {
  return { name };
}

const LISTING_DETAIL_FORMS: Record<string, AddListingFormState> = {
  "toyota-camry-2021": {
    ...EMPTY_ADD_LISTING_FORM,
    category: "cars",
    carName: "Toyota Camry",
    carModel: "2.5L XLE",
    transmission: "automatic",
    year: "2021",
    comesWithDriver: false,
    shortDescription:
      "Clean, well-maintained Camry ideal for city trips and airport runs. AC, Bluetooth, and reverse camera included.",
    perks: ["Air conditioning", "Bluetooth", "Reverse camera", "USB charging"],
    mediaItems: mediaFromImages(
      ["/hero/car-rentals.png", "/destinations/lagos.png"],
      "toyota-camry",
    ),
    pickupAddress: "12 Admiralty Way, Lekki Phase 1, Lagos",
    handoverMethods: ["client_pickup", "delivery"],
    price12hr: "35000",
    price24hr: "55000",
    priceMultiDay: "48000",
    deliveryFee: "8000",
    uploadedDocuments: {
      cac: documentStub("CAC-RC-1487523.pdf"),
    },
    gpsAcknowledged: true,
  },
  "lekki-garden-suites": {
    ...EMPTY_ADD_LISTING_FORM,
    category: "accommodations",
    propertyName: "Lekki Garden Suites",
    propertyType: "Apartment",
    address: "Lekki Phase 1, Lagos, Nigeria",
    accommodationMaxGuests: "6",
    checkInTime: "14:00",
    checkOutTime: "11:00",
    availabilityMode: "always",
    isPropertyOwner: true,
    bedrooms: "3",
    bathrooms: "3",
    accommodationDescription:
      "Bright garden-facing suites with fast Wi-Fi, full kitchen, and secure parking — minutes from Lekki restaurants and beaches.",
    amenities: ["Wi-Fi", "Parking", "Kitchen", "Air conditioning", "Workspace"],
    mediaItems: mediaFromImages(
      ["/hero/accommodations.png", "/destinations/lagos.png"],
      "lekki-garden",
    ),
    roomTypes: [
      {
        id: "room-deluxe",
        name: "Deluxe Suite",
        description: "Spacious suite with garden view and king bed.",
        maxGuests: "2",
        pricePerNight: "85000",
      },
      {
        id: "room-family",
        name: "Family Suite",
        description: "Two bedrooms with living area, ideal for families.",
        maxGuests: "4",
        pricePerNight: "140000",
      },
    ],
    uploadedDocuments: {
      cac: documentStub("CAC-RC-1487523.pdf"),
    },
  },
  "victoria-island-loft": {
    ...EMPTY_ADD_LISTING_FORM,
    category: "accommodations",
    propertyName: "Victoria Island Loft",
    propertyType: "Loft",
    address: "Victoria Island, Lagos, Nigeria",
    accommodationMaxGuests: "4",
    checkInTime: "15:00",
    checkOutTime: "11:00",
    availabilityMode: "always",
    isPropertyOwner: true,
    bedrooms: "2",
    bathrooms: "2",
    accommodationDescription:
      "Modern loft with open living space, city views, and walkable access to VI nightlife and business districts.",
    amenities: ["Wi-Fi", "Elevator", "Smart TV", "Washer", "Security"],
    mediaItems: mediaFromImages(["/hero/accommodations.png"], "vi-loft"),
    roomTypes: [
      {
        id: "room-loft",
        name: "Entire loft",
        description: "Full loft apartment with two bedrooms.",
        maxGuests: "4",
        pricePerNight: "120000",
      },
    ],
    uploadedDocuments: {
      cac: documentStub("CAC-RC-1487523.pdf"),
    },
  },
  "lagos-lagoon-sunset-cruise": {
    ...EMPTY_ADD_LISTING_FORM,
    category: "experiences",
    experienceName: "Lagos Lagoon Sunset Cruise",
    experienceType: "Boat cruise",
    location: "Victoria Island, Lagos",
    duration: "3 hours",
    maxGuests: "12",
    experienceDescription:
      "Golden-hour cruise across the lagoon with soft drinks, photo stops, and a guided commentary of Lagos waterfront landmarks.",
    operatingDays: ["fri", "sat", "sun"],
    experienceStartTime: "17:00",
    experienceEndTime: "20:00",
    experienceScheduleMode: "weekly",
    includes: ["Boat ride", "Soft drinks", "Life jackets", "Guide"],
    whatToBring: ["Comfortable shoes", "Camera", "Light jacket"],
    additionalInfo: "Boarding closes 15 minutes before departure.",
    mediaItems: mediaFromImages(
      ["/destinations/lagos.png", "/hero/accommodations.png"],
      "lagoon-cruise",
    ),
    pricePerPerson: "25000",
    groupTicketPrice: "20000",
    minGroupSize: "4",
    maxGroupSize: "12",
    uploadedDocuments: {
      cac: documentStub("CAC-RC-1487523.pdf"),
    },
  },
  "lagos-food-experience": {
    ...EMPTY_ADD_LISTING_FORM,
    category: "experiences",
    experienceName: "Lagos Food Experience",
    experienceType: "Food tour",
    location: "Yaba, Lagos",
    duration: "4 hours",
    maxGuests: "10",
    experienceDescription:
      "A guided tasting walk through local favorites — street snacks, market stops, and classic Lagos dishes.",
    includes: ["Guided tasting", "Soft drink", "Market visit"],
    whatToBring: ["Comfortable walking shoes", "Appetite"],
    mediaItems: mediaFromImages(["/destinations/lagos.png"], "food-experience"),
    pricePerPerson: "18000",
    groupTicketPrice: "15000",
    minGroupSize: "2",
    maxGroupSize: "10",
    uploadedDocuments: {
      cac: documentStub("CAC-RC-1487523.pdf"),
    },
  },
  "tarkwa-bay-tour": {
    ...EMPTY_ADD_LISTING_FORM,
    category: "experiences",
    experienceName: "Tarkwa Bay Tour",
    experienceType: "Day trip",
    location: "Tarkwa Bay, Lagos",
    duration: "6 hours",
    maxGuests: "15",
    experienceDescription:
      "Beach day trip with boat transfer, free time on the sand, and optional picnic setup.",
    includes: ["Boat transfer", "Beach access", "Guide"],
    whatToBring: ["Swimwear", "Sunscreen", "Towel"],
    mediaItems: mediaFromImages(["/destinations/lagos.png"], "tarkwa-bay"),
    pricePerPerson: "22000",
    uploadedDocuments: {
      cac: documentStub("CAC-RC-1487523.pdf"),
    },
  },
};

function fallbackFormFromBooking(listingId: string): AddListingFormState | null {
  const booking = VENDOR_BOOKINGS.find((item) => item.listingId === listingId);
  if (!booking) {
    return null;
  }

  const category =
    booking.productType === "car"
      ? ("cars" as const)
      : booking.productType === "accommodation"
        ? ("accommodations" as const)
        : ("experiences" as const);

  if (category === "cars") {
    return {
      ...EMPTY_ADD_LISTING_FORM,
      category,
      carName: booking.listingTitle,
      year: "2024",
      carModel: "Standard",
      shortDescription: "Vendor listing details preview.",
      mediaItems: mediaFromImages([booking.listingImage], listingId),
      pickupAddress: booking.pickupAddress ?? "Lagos, Nigeria",
      price12hr: String(Math.round(booking.amount * 0.6)),
      price24hr: String(booking.amount),
      priceMultiDay: String(Math.round(booking.amount * 0.85)),
      uploadedDocuments: { cac: documentStub("CAC.pdf") },
      gpsAcknowledged: true,
    };
  }

  if (category === "accommodations") {
    return {
      ...EMPTY_ADD_LISTING_FORM,
      category,
      propertyName: booking.listingTitle,
      propertyType: "Apartment",
      address: "Lagos, Nigeria",
      accommodationMaxGuests: String(booking.guestCount || 2),
      accommodationDescription: "Vendor listing details preview.",
      mediaItems: mediaFromImages([booking.listingImage], listingId),
      roomTypes: [
        {
          id: "room-default",
          name: "Standard room",
          description: "Comfortable room for your stay.",
          maxGuests: String(booking.guestCount || 2),
          pricePerNight: String(booking.amount),
        },
      ],
      uploadedDocuments: { cac: documentStub("CAC.pdf") },
    };
  }

  return {
    ...EMPTY_ADD_LISTING_FORM,
    category,
    experienceName: booking.listingTitle,
    experienceType: "Experience",
    location: "Lagos, Nigeria",
    duration: "3 hours",
    experienceDescription: "Vendor listing details preview.",
    mediaItems: mediaFromImages([booking.listingImage], listingId),
    pricePerPerson: String(booking.amount),
    uploadedDocuments: { cac: documentStub("CAC.pdf") },
  };
}

/** Full listing payload shaped like the add-listing review form. */
export function getVendorListingDetailForm(
  listingId: string,
): AddListingFormState | null {
  if (LISTING_DETAIL_FORMS[listingId]) {
    return LISTING_DETAIL_FORMS[listingId]!;
  }

  const listing = getVendorListingById(listingId);
  if (listing) {
    const category = mapListingCategoryKey(listing.categoryKey);
    const mediaItems = mediaFromImages([listing.image], listing.id);

    if (category === "cars") {
      return {
        ...EMPTY_ADD_LISTING_FORM,
        category,
        carName: listing.title,
        year: "2024",
        carModel: "Standard",
        shortDescription: "Vendor listing details preview.",
        mediaItems,
        pickupAddress: "Lagos, Nigeria",
        price12hr: "30000",
        price24hr: "50000",
        priceMultiDay: "45000",
        uploadedDocuments: { cac: documentStub("CAC.pdf") },
        gpsAcknowledged: true,
      };
    }

    if (category === "accommodations") {
      return {
        ...EMPTY_ADD_LISTING_FORM,
        category,
        propertyName: listing.title,
        propertyType: "Apartment",
        address: "Lagos, Nigeria",
        accommodationMaxGuests: "4",
        accommodationDescription: "Vendor listing details preview.",
        mediaItems,
        roomTypes: [
          {
            id: "room-default",
            name: "Standard room",
            description: "Comfortable room for your stay.",
            maxGuests: "2",
            pricePerNight: "80000",
          },
        ],
        uploadedDocuments: { cac: documentStub("CAC.pdf") },
      };
    }

    return {
      ...EMPTY_ADD_LISTING_FORM,
      category,
      experienceName: listing.title,
      experienceType: "Experience",
      location: "Lagos, Nigeria",
      duration: "3 hours",
      experienceDescription: "Vendor listing details preview.",
      mediaItems,
      pricePerPerson: "20000",
      uploadedDocuments: { cac: documentStub("CAC.pdf") },
    };
  }

  return fallbackFormFromBooking(listingId);
}
