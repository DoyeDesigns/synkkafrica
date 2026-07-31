import { apiFetch } from "@/lib/api/backend";
import type { PackageApi } from "@/lib/api/packages";

export type AdminVendor = {
  id: string;
  email: string;
  businessName: string;
  businessType: string;
  ownerFullName: string;
  phoneNumber: string | null;
  status: "pending" | "active" | "suspended" | "rejected";
  rejectionReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
};

export type AdminListing = {
  id: string;
  vendorId: string;
  category: "cars" | "accommodations" | "experiences";
  title: string;
  status: "draft" | "pending" | "live" | "paused" | "rejected";
  location: string | null;
  coverImageUrl: string | null;
  rejectionReason: string | null;
  createdAt: string;
};

// --- Vendors ---

export async function adminListVendors(
  token: string,
  status?: string,
): Promise<AdminVendor[]> {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiFetch<AdminVendor[]>(`/admin/vendors${qs}`, { token });
}

export async function adminApproveVendor(
  token: string,
  id: string,
): Promise<AdminVendor> {
  return apiFetch<AdminVendor>(`/admin/vendors/${id}/approve`, {
    method: "PATCH",
    token,
  });
}

export async function adminRejectVendor(
  token: string,
  id: string,
  reason?: string,
): Promise<AdminVendor> {
  return apiFetch<AdminVendor>(`/admin/vendors/${id}/reject`, {
    method: "PATCH",
    token,
    body: { reason },
  });
}

// --- Listings ---

export async function adminListListings(
  token: string,
  status?: string,
): Promise<AdminListing[]> {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiFetch<AdminListing[]>(`/admin/vendor-listings${qs}`, { token });
}

export async function adminApproveListing(
  token: string,
  id: string,
): Promise<AdminListing> {
  return apiFetch<AdminListing>(`/admin/vendor-listings/${id}/approve`, {
    method: "PATCH",
    token,
  });
}

export async function adminRejectListing(
  token: string,
  id: string,
  reason?: string,
): Promise<AdminListing> {
  return apiFetch<AdminListing>(`/admin/vendor-listings/${id}/reject`, {
    method: "PATCH",
    token,
    body: { reason },
  });
}

// --- Packages ---

export type AdminPackageInput = {
  title: string;
  days?: number;
  nights?: number;
  scheduleLabel?: string;
  savingsPercent?: number;
  currentPrice: number;
  separateBookingPrice?: number;
  currency?: string;
  image?: string;
  inclusions?: string[];
  status?: "draft" | "published";
  sortOrder?: number;
};

export async function adminListPackages(token: string): Promise<PackageApi[]> {
  return apiFetch<PackageApi[]>("/admin/packages", { token });
}

export async function adminCreatePackage(
  token: string,
  input: AdminPackageInput,
): Promise<PackageApi> {
  return apiFetch<PackageApi>("/admin/packages", {
    method: "POST",
    token,
    body: input,
  });
}

export async function adminUpdatePackage(
  token: string,
  id: string,
  input: AdminPackageInput,
): Promise<PackageApi> {
  return apiFetch<PackageApi>(`/admin/packages/${id}`, {
    method: "PATCH",
    token,
    body: input,
  });
}

export async function adminDeletePackage(
  token: string,
  id: string,
): Promise<void> {
  await apiFetch<void>(`/admin/packages/${id}`, { method: "DELETE", token });
}

// --- Vendor bookings (oversight) ---

export type AdminBooking = {
  id: string;
  vendorId: string;
  bookingReference: string;
  productType: string | null;
  listingTitle: string;
  guestCount: number;
  guestFirstName: string | null;
  status: string;
  amount: number;
  currency: string;
  paymentSecured: boolean;
  experienceDate: string | null;
  createdAt: string;
};

export async function adminListBookings(
  token: string,
  status?: string,
): Promise<AdminBooking[]> {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiFetch<AdminBooking[]>(`/admin/vendor-bookings${qs}`, { token });
}

// --- Payouts ---

export type AdminPayout = {
  id: string;
  vendorId: string;
  amount: number;
  currency: string;
  title: string;
  status: "pending" | "completed" | "failed";
  occurredAt: string;
};

export async function adminListPayouts(
  token: string,
  status?: string,
): Promise<AdminPayout[]> {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiFetch<AdminPayout[]>(`/admin/vendor-payouts${qs}`, { token });
}

export async function adminApprovePayout(
  token: string,
  id: string,
): Promise<AdminPayout> {
  return apiFetch<AdminPayout>(`/admin/vendor-payouts/${id}/approve`, {
    method: "PATCH",
    token,
  });
}

export async function adminRejectPayout(
  token: string,
  id: string,
): Promise<AdminPayout> {
  return apiFetch<AdminPayout>(`/admin/vendor-payouts/${id}/reject`, {
    method: "PATCH",
    token,
  });
}

// --- Business KYC documents ---

export type AdminBusinessDoc = {
  id: string;
  vendorId: string;
  type: string;
  fileName: string;
  fileUrl: string | null;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

export async function adminListBusinessDocs(
  token: string,
  status?: string,
): Promise<AdminBusinessDoc[]> {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiFetch<AdminBusinessDoc[]>(`/admin/vendor-documents${qs}`, { token });
}

export async function adminApproveBusinessDoc(
  token: string,
  id: string,
): Promise<AdminBusinessDoc> {
  return apiFetch<AdminBusinessDoc>(`/admin/vendor-documents/${id}/approve`, {
    method: "PATCH",
    token,
  });
}

export async function adminRejectBusinessDoc(
  token: string,
  id: string,
): Promise<AdminBusinessDoc> {
  return apiFetch<AdminBusinessDoc>(`/admin/vendor-documents/${id}/reject`, {
    method: "PATCH",
    token,
  });
}
