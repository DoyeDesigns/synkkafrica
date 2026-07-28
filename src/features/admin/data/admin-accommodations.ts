import type { AdminListing } from "@/features/admin/data/admin-listings";

const ACCOMMODATION_IMAGES = [
  "/hero/accomodations/c0ea5f93656a3e5da2a9ee3ef099dd3f316a2a09.jpg",
  "/hero/accomodations/bc926fd99b1d544dcd78428d822ed93a9d3bec08.jpg",
  "/hero/accomodations/3bd7c33eb47a06fd682702112980e1d211694a4d.jpg",
  "/hero/accommodations.png",
] as const;

function withAccommodationImages(
  listings: Omit<AdminListing, "image">[],
): AdminListing[] {
  return listings.map((listing, index) => ({
    ...listing,
    image:
      ACCOMMODATION_IMAGES[index % ACCOMMODATION_IMAGES.length] ??
      ACCOMMODATION_IMAGES[0],
  }));
}

export const ADMIN_ACCOMMODATIONS: AdminListing[] = withAccommodationImages([
  {
    id: "stay-lekki-garden",
    name: "Lekki Garden Suites",
    location: "Lekki Phase 1, Lagos",
    vendorName: "Luxe Lagos Stays",
    vendorId: "vendor-luxe",
    bookings: 189,
    rating: 4.6,
    reviewCount: 134,
    status: "active",
    publicUrl: "/accommodations/stay-lekki-garden/book",
  },
  {
    id: "stay-vi-penthouse",
    name: "Victoria Island Penthouse",
    location: "Victoria Island, Lagos",
    vendorName: "Luxe Lagos Stays",
    vendorId: "vendor-luxe",
    bookings: 76,
    rating: 4.8,
    reviewCount: 51,
    status: "active",
    publicUrl: "/accommodations/stay-vi-penthouse/book",
  },
  {
    id: "stay-eko-beachfront",
    name: "Eko Beachfront Apartment",
    location: "Eko Atlantic, Lagos",
    vendorName: "Coastal Trails NG",
    vendorId: "vendor-coastal",
    bookings: 62,
    rating: 4.5,
    reviewCount: 43,
    status: "active",
    publicUrl: "/accommodations/stay-eko-beachfront/book",
  },
  {
    id: "stay-ikeja-studio",
    name: "Ikeja Airport Studio",
    location: "Ikeja, Lagos",
    vendorName: "Luxe Lagos Stays",
    vendorId: "vendor-luxe",
    bookings: 118,
    rating: 4.3,
    reviewCount: 87,
    status: "active",
    publicUrl: "/accommodations/stay-ikeja-studio/book",
  },
  {
    id: "stay-abuja-villa",
    name: "Abuja Diplomatic Villa",
    location: "Maitama, Abuja",
    vendorName: "Safari Connect Tours",
    vendorId: "vendor-safari",
    bookings: 45,
    rating: 4.7,
    reviewCount: 31,
    status: "active",
    publicUrl: "/accommodations/stay-abuja-villa/book",
  },
  {
    id: "stay-calabar-lodge",
    name: "Calabar Riverside Lodge",
    location: "Calabar, Nigeria",
    vendorName: "Coastal Trails NG",
    vendorId: "vendor-coastal",
    bookings: 29,
    rating: 4.2,
    reviewCount: 17,
    status: "inactive",
    publicUrl: "/accommodations/stay-calabar-lodge/book",
  },
  {
    id: "stay-banana-island",
    name: "Banana Island Waterfront Home",
    location: "Banana Island, Lagos",
    vendorName: "Luxe Lagos Stays",
    vendorId: "vendor-luxe",
    bookings: 38,
    rating: 4.9,
    reviewCount: 24,
    status: "active",
    publicUrl: "/accommodations/stay-banana-island/book",
  },
  {
    id: "stay-yaba-loft",
    name: "Yaba Creative Loft",
    location: "Yaba, Lagos",
    vendorName: "Alex Autos",
    vendorId: "vendor-alex",
    bookings: 21,
    rating: 4.0,
    reviewCount: 14,
    status: "inactive",
    publicUrl: "/accommodations/stay-yaba-loft/book",
  },
]);
