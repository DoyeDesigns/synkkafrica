import { apiFetch } from "@/lib/api/backend";
import type { VerificationStatus } from "@/lib/api/admin";

export type CurrencyAmount = { currency: string; amount: number };

export type AdminVendorStats = {
  vendorId: string;
  listingsCount: number;
  liveListings: number;
  pendingListings: number;
  ratingAvg: number | null;
  reviewCount: number;
  bookingsCount: number;
  completedBookings: number;
  // Confirmed + completed booking value, per currency, largest first.
  revenue: CurrencyAmount[];
};

export type AdminVendorStatsList = {
  // The marketplace commission (platform share of each booking), in percent.
  platformSharePercent: number;
  // Vendors with no listings, reviews or bookings are absent.
  vendors: AdminVendorStats[];
};

// GET /admin/vendor-insights
export async function adminListVendorStats(
  token: string,
): Promise<AdminVendorStatsList> {
  return apiFetch<AdminVendorStatsList>("/admin/vendor-insights", { token });
}

export type AdminVendorPayoutBalance = {
  currency: string;
  lifetimeEarnings: number;
  availableBalance: number;
  pendingPayouts: number;
  paidOut: number;
};

export type AdminVendorRecentBooking = {
  id: string;
  bookingReference: string;
  listingId: string | null;
  listingTitle: string;
  productType: string | null;
  guestFirstName: string | null;
  guestCount: number;
  status: string;
  amount: number;
  currency: string;
  paymentSecured: boolean;
  experienceDate: string | null;
  checkOutDate: string | null;
  createdAt: string;
};

export type AdminVendorListingDocument = {
  id: string;
  listingId: string;
  listingTitle: string | null;
  type: string;
  fileName: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason: string | null;
  createdAt: string;
};

export type AdminVendorInsights = AdminVendorStats & {
  emailVerified: boolean;
  lastLoginAt: string | null;
  reviewedAt: string | null;
  platformSharePercent: number;
  openTickets: number;
  bookingsByStatus: Record<string, number>;
  payouts: {
    balances: AdminVendorPayoutBalance[];
    pendingPayoutCount: number;
    lastPayoutAt: string | null;
  };
  recentBookings: AdminVendorRecentBooking[];
  listingDocuments: AdminVendorListingDocument[];
};

// GET /admin/vendor-insights/:id
export async function adminGetVendorInsights(
  token: string,
  id: string,
): Promise<AdminVendorInsights> {
  return apiFetch<AdminVendorInsights>(`/admin/vendor-insights/${id}`, {
    token,
  });
}

export type AdminVerificationDoc = {
  id: string;
  vendorId: string;
  type: string;
  fileName: string;
  hasFile: boolean;
  status: "pending" | "approved" | "rejected";
  verificationStatus: VerificationStatus;
  verifiedAt: string | null;
  reviewedAt: string | null;
  createdAt: string;
  businessName: string;
  ownerFullName: string;
  email: string;
  phoneNumber: string | null;
  vendorStatus: "pending" | "active" | "suspended" | "rejected";
  cacRegistrationNumber: string | null;
  cacVerificationStatus: VerificationStatus;
  cacVerifiedName: string | null;
};

export type AdminVerificationQueue = {
  stats: {
    pending: number;
    approvedToday: number;
    rejectedToday: number;
    avgReviewMinutes: number | null;
  };
  documents: AdminVerificationDoc[];
};

// GET /admin/verification-queue
export async function adminGetVerificationQueue(
  token: string,
): Promise<AdminVerificationQueue> {
  return apiFetch<AdminVerificationQueue>("/admin/verification-queue", {
    token,
  });
}
