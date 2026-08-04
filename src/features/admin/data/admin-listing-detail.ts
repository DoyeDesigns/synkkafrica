import type { AdminListing, AdminListingKind } from "@/features/admin/data/admin-listings";
import {
  EMPTY_ADD_LISTING_FORM,
  type AddListingFormState,
  type ListingMediaItem,
} from "@/features/vendor/data/vendor-add-listing";
import { getVendorListingDetailForm } from "@/features/vendor/data/vendor-listing-detail";

const ADMIN_TO_VENDOR_LISTING_ID: Record<string, string> = {
  "car-toyota-camry": "toyota-camry-2021",
  "stay-lekki-garden": "lekki-garden-suites",
};

function documentStub(name: string) {
  return { name };
}

function mediaFromImage(image: string, baseName: string): ListingMediaItem[] {
  return [
    {
      id: `${baseName}-1`,
      name: `${baseName}-1.jpg`,
      previewUrl: image,
      kind: "image",
    },
  ];
}

function buildFormFromAdminListing(
  listing: AdminListing,
  kind: AdminListingKind,
): AddListingFormState {
  const mediaItems = mediaFromImage(listing.image, listing.id);

  if (kind === "cars") {
    return {
      ...EMPTY_ADD_LISTING_FORM,
      category: "cars",
      carName: listing.name,
      carModel: "Standard",
      year: "2024",
      shortDescription: `${listing.name} listed by ${listing.vendorName} in ${listing.location}.`,
      mediaItems,
      pickupAddress: listing.location,
      handoverMethods: ["client_pickup", "delivery"],
      price12hr: "35000",
      price24hr: "55000",
      priceMultiDay: "48000",
      deliveryFee: "8000",
      uploadedDocuments: { cac: documentStub("CAC-RC-1487523.pdf") },
      gpsAcknowledged: true,
    };
  }

  if (kind === "accommodations") {
    return {
      ...EMPTY_ADD_LISTING_FORM,
      category: "accommodations",
      propertyName: listing.name,
      propertyType: "Apartment",
      address: listing.location,
      accommodationMaxGuests: "4",
      checkInTime: "14:00",
      checkOutTime: "11:00",
      availabilityMode: "always",
      isPropertyOwner: true,
      bedrooms: "2",
      bathrooms: "2",
      accommodationDescription: `${listing.name} listed by ${listing.vendorName} in ${listing.location}.`,
      amenities: ["Wi-Fi", "Parking", "Air conditioning"],
      mediaItems,
      roomTypes: [
        {
          id: "room-default",
          name: "Standard room",
          description: "Comfortable room for your stay.",
          maxGuests: "2",
          pricePerNight: "85000",
        },
      ],
      uploadedDocuments: { cac: documentStub("CAC-RC-1487523.pdf") },
    };
  }

  return {
    ...EMPTY_ADD_LISTING_FORM,
    category: "experiences",
    experienceName: listing.name,
    experienceType: "Experience",
    location: listing.location,
    duration: "3 hours",
    maxGuests: "12",
    experienceDescription: `${listing.name} listed by ${listing.vendorName} in ${listing.location}.`,
    mediaItems,
    pricePerPerson: "25000",
    uploadedDocuments: { cac: documentStub("CAC-RC-1487523.pdf") },
  };
}

export function getAdminListingDetailForm(
  listing: AdminListing,
  kind: AdminListingKind,
): AddListingFormState {
  const vendorListingId = ADMIN_TO_VENDOR_LISTING_ID[listing.id] ?? listing.id;
  const vendorForm = getVendorListingDetailForm(vendorListingId);

  if (vendorForm) {
    return vendorForm;
  }

  return buildFormFromAdminListing(listing, kind);
}
