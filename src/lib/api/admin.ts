import { apiFetch } from "@/lib/api/backend";
import type { PackageApi } from "@/lib/api/packages";
import type {
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketStatus,
} from "@/features/vendor/data/vendor-support";

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

export type AdminVendorDetail = AdminVendor & {
  cacRegistrationNumber: string | null;
  businessAddress: string | null;
  dateOfBirth: string | null;
  payoutBankId: string | null;
  payoutAccountNumber: string | null;
  payoutAccountName: string | null;
  documents: AdminBusinessDoc[];
  listings: AdminListing[];
};

export async function adminGetVendor(
  token: string,
  id: string,
): Promise<AdminVendorDetail> {
  return apiFetch<AdminVendorDetail>(`/admin/vendors/${id}`, { token });
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

export type AdminListingMedia = {
  name?: string;
  url?: string;
  kind?: string;
};

export type AdminListingDocument = {
  id: string;
  type: string;
  fileName: string;
  fileUrl: string | null;
  status: "pending" | "approved" | "rejected";
  rejectionReason: string | null;
};

export type AdminListingDetail = AdminListing & {
  shortDescription: string | null;
  details: Record<string, unknown>;
  media: AdminListingMedia[];
  ratingAvg: string;
  ratingCount: number;
  reviewedAt: string | null;
  vendorName: string;
  vendorStatus: AdminVendor["status"];
  documents: AdminListingDocument[];
};

export async function adminGetListing(
  token: string,
  id: string,
): Promise<AdminListingDetail> {
  return apiFetch<AdminListingDetail>(`/admin/vendor-listings/${id}`, { token });
}

// Short-lived signed URL to view a private listing compliance document.
export async function adminListingDocViewUrl(
  token: string,
  id: string,
): Promise<{ url: string }> {
  return apiFetch<{ url: string }>(
    `/admin/vendor-listing-documents/${id}/view-url`,
    { token },
  );
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

// Short-lived signed URL to view a private KYC document.
export async function adminBusinessDocViewUrl(
  token: string,
  id: string,
): Promise<{ url: string }> {
  return apiFetch<{ url: string }>(`/admin/vendor-documents/${id}/view-url`, {
    token,
  });
}

// --- Overview + customers ---

export type AdminOverview = {
  pendingVendors: number;
  activeVendors: number;
  pendingListings: number;
  liveListings: number;
  pendingPayouts: number;
  pendingDocuments: number;
  openSupportTickets: number;
  totalBookings: number;
  awaitingBookings: number;
  customers: number;
  grossBookingValue: number;
  currency: string;
};

export async function adminGetOverview(token: string): Promise<AdminOverview> {
  return apiFetch<AdminOverview>("/admin/overview", { token });
}

export type AdminCustomer = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  emailVerified: boolean;
  deleted: boolean;
  createdAt: string;
};

export async function adminListCustomers(
  token: string,
): Promise<AdminCustomer[]> {
  return apiFetch<AdminCustomer[]>("/admin/customers", { token });
}

// --- Reviews moderation ---

export type AdminReview = {
  id: string;
  listingId: string;
  listingTitle: string | null;
  authorName: string | null;
  rating: number;
  comment: string | null;
  status: "published" | "hidden";
  createdAt: string;
};

export async function adminListReviews(
  token: string,
  status?: string,
): Promise<AdminReview[]> {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiFetch<AdminReview[]>(`/admin/reviews${qs}`, { token });
}

export async function adminHideReview(
  token: string,
  id: string,
): Promise<{ id: string; status: string }> {
  return apiFetch(`/admin/reviews/${id}/hide`, { method: "PATCH", token });
}

export async function adminPublishReview(
  token: string,
  id: string,
): Promise<{ id: string; status: string }> {
  return apiFetch(`/admin/reviews/${id}/publish`, { method: "PATCH", token });
}

// --- Support tickets ---

export type AdminSupportTicket = {
  id: string;
  ticketNumber: string;
  vendorId: string;
  requesterName: string;
  audience: "vendors";
  subject: string;
  category: SupportTicketCategory;
  priority: SupportTicketPriority;
  description: string;
  status: SupportTicketStatus;
  bookingReference: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminSupportMessage = {
  id: string;
  authorRole: "vendor" | "admin";
  body: string;
  createdAt: string;
};

export type AdminSupportTicketDetail = AdminSupportTicket & {
  messages: AdminSupportMessage[];
};

export async function adminListSupportTickets(
  token: string,
  status?: string,
): Promise<AdminSupportTicket[]> {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiFetch<AdminSupportTicket[]>(`/admin/support-tickets${qs}`, { token });
}

export async function adminGetSupportTicket(
  token: string,
  id: string,
): Promise<AdminSupportTicketDetail> {
  return apiFetch<AdminSupportTicketDetail>(`/admin/support-tickets/${id}`, {
    token,
  });
}

export async function adminReplySupportTicket(
  token: string,
  id: string,
  body: string,
  status?: SupportTicketStatus,
): Promise<AdminSupportTicketDetail> {
  return apiFetch<AdminSupportTicketDetail>(
    `/admin/support-tickets/${id}/messages`,
    { method: "POST", token, body: { body, status } },
  );
}

export async function adminSetSupportTicketStatus(
  token: string,
  id: string,
  status: SupportTicketStatus,
): Promise<AdminSupportTicketDetail> {
  return apiFetch<AdminSupportTicketDetail>(
    `/admin/support-tickets/${id}/status`,
    { method: "PATCH", token, body: { status } },
  );
}

// --- Admin team (super-admin only) ---

export const INVITABLE_ADMIN_ROLES = ["support", "finance", "pricing"] as const;
export type InvitableAdminRole = (typeof INVITABLE_ADMIN_ROLES)[number];
export type AdminRole = InvitableAdminRole | "super_admin";

export type AdminTeamMember = {
  id: string;
  email: string;
  role: AdminRole;
  isSuperAdmin: boolean;
  mfaEnrolled: boolean;
  disabledAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
};

export type AdminInvite = {
  id: string;
  email: string;
  role: AdminRole;
  expiresAt: string;
  acceptedAt: string | null;
  expired: boolean;
  createdAt: string;
};

export async function adminListTeam(token: string): Promise<AdminTeamMember[]> {
  return apiFetch<AdminTeamMember[]>("/admin/admins", { token });
}

export async function adminListInvites(token: string): Promise<AdminInvite[]> {
  return apiFetch<AdminInvite[]>("/admin/admins/invites", { token });
}

export async function adminInviteAdmin(
  token: string,
  input: { email: string; role: InvitableAdminRole },
): Promise<AdminInvite & { acceptUrl: string }> {
  return apiFetch<AdminInvite & { acceptUrl: string }>("/admin/admins/invites", {
    method: "POST",
    token,
    body: input,
  });
}

export async function adminRevokeInvite(
  token: string,
  id: string,
): Promise<void> {
  await apiFetch<void>(`/admin/admins/invites/${id}`, {
    method: "DELETE",
    token,
  });
}
