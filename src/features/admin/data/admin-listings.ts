import { ADMIN_ACCOMMODATIONS } from "@/features/admin/data/admin-accommodations";
import { ADMIN_CARS } from "@/features/admin/data/admin-cars";
import { ADMIN_EXPERIENCES } from "@/features/admin/data/admin-experiences";

export type AdminListingKind = "experiences" | "cars" | "accommodations";

export type AdminListingStatus = "active" | "inactive" | "deleted";

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
  deletedAt?: string;
};

export function getAdminListingDetailHref(
  kind: AdminListingKind,
  listingId: string,
): string {
  return `/admin/${kind}/${encodeURIComponent(listingId)}`;
}

export function getAdminListingsByKind(kind: AdminListingKind): AdminListing[] {
  switch (kind) {
    case "cars":
      return ADMIN_CARS;
    case "accommodations":
      return ADMIN_ACCOMMODATIONS;
    case "experiences":
      return ADMIN_EXPERIENCES;
  }
}

export function getAdminListingById(
  kind: AdminListingKind,
  listingId: string,
): AdminListing | null {
  return (
    getAdminListingsByKind(kind).find((listing) => listing.id === listingId) ?? null
  );
}

export function filterAdminListings(
  listings: AdminListing[],
  query: string,
  view: "active" | "deleted" = "active",
) {
  const normalizedQuery = query.trim().toLowerCase();
  const byView = listings.filter((listing) =>
    view === "deleted"
      ? listing.status === "deleted"
      : listing.status !== "deleted",
  );

  if (!normalizedQuery) {
    return byView;
  }

  return byView.filter(
    (listing) =>
      listing.name.toLowerCase().includes(normalizedQuery) ||
      listing.location.toLowerCase().includes(normalizedQuery) ||
      listing.vendorName.toLowerCase().includes(normalizedQuery),
  );
}
