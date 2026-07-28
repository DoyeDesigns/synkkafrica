export type AdminListingKind = "experiences" | "cars" | "accommodations";

export type AdminListingStatus = "active" | "inactive";

export type AdminListing = {
  id: string;
  name: string;
  image: string;
  location: string;
  vendorName: string;
  vendorId: string;
  bookings: number;
  rating: number;
  reviewCount: number;
  status: AdminListingStatus;
  publicUrl: string;
};

export function filterAdminListings(listings: AdminListing[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return listings;
  }

  return listings.filter(
    (listing) =>
      listing.name.toLowerCase().includes(normalizedQuery) ||
      listing.location.toLowerCase().includes(normalizedQuery) ||
      listing.vendorName.toLowerCase().includes(normalizedQuery),
  );
}
