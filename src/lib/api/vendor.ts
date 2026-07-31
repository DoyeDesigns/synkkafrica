import { apiFetch, type BackendTokens } from "@/lib/api/backend";

// Mirrors the backend VendorDto (GET /vendor/auth/me, and the `vendor` field on
// signup/login responses).
export type VendorProfile = {
  id: string;
  email: string;
  status: "pending" | "active" | "suspended" | "rejected";
  emailVerified: boolean;
  businessName: string;
  businessType: string;
  cacRegistrationNumber?: string | null;
  businessAddress?: string | null;
  ownerFullName: string;
  phoneNumber?: string | null;
  dateOfBirth?: string | null;
  createdAt: string;
};

export type VendorAuthResult = BackendTokens & { vendor: VendorProfile };

export type VendorSignupInput = {
  businessName: string;
  businessType: string;
  cacRegistrationNumber?: string;
  businessAddress?: string;
  ownerFullName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string; // YYYY-MM-DD
  password: string;
  signupToken: string;
  governmentIdFileName?: string;
};

// Step 1 of signup — email a 6-digit code (no account enumeration).
export async function requestVendorOtp(email: string): Promise<void> {
  await apiFetch<void>("/vendor/auth/request-otp", { body: { email } });
}

// Step 2 — verify the code, returning a short-lived token that proves the
// email is owned; the final signup call presents it.
export async function verifyVendorOtp(
  email: string,
  code: string,
): Promise<{ signupToken: string }> {
  return apiFetch<{ signupToken: string }>("/vendor/auth/verify-otp", {
    body: { email, code },
  });
}

// Step 3 — create the vendor (status `pending`) and return tokens (auto-login).
export async function signupVendor(
  input: VendorSignupInput,
): Promise<VendorAuthResult> {
  return apiFetch<VendorAuthResult>("/vendor/auth/signup", { body: input });
}

export async function loginVendor(
  email: string,
  password: string,
): Promise<VendorAuthResult> {
  return apiFetch<VendorAuthResult>("/vendor/auth/login", {
    body: { email, password },
  });
}

export async function refreshVendorTokens(
  refreshToken: string,
): Promise<BackendTokens> {
  return apiFetch<BackendTokens>("/vendor/auth/refresh", {
    body: { refreshToken },
  });
}

export async function signOutVendor(refreshToken: string): Promise<void> {
  await apiFetch<void>("/vendor/auth/signout", { body: { refreshToken } });
}

export async function getVendorProfile(token: string): Promise<VendorProfile> {
  return apiFetch<VendorProfile>("/vendor/auth/me", { token });
}

// --- Business profile (GET/PATCH /vendor/profile, POST /vendor/change-password) ---

export type VendorDocument = {
  id: string;
  type: string;
  fileName: string;
  fileUrl?: string | null;
  status: string;
  createdAt: string;
};

export type VendorFullProfile = VendorProfile & {
  payoutBankId?: string | null;
  payoutAccountNumber?: string | null;
  payoutAccountName?: string | null;
  documents: VendorDocument[];
};

export type UpdateVendorProfileInput = Partial<{
  businessName: string;
  ownerFullName: string;
  phoneNumber: string;
  businessAddress: string;
  payoutBankId: string;
  payoutAccountNumber: string;
  payoutAccountName: string;
}>;

export async function getVendorFullProfile(
  token: string,
): Promise<VendorFullProfile> {
  return apiFetch<VendorFullProfile>("/vendor/profile", { token });
}

export async function updateVendorProfile(
  token: string,
  patch: UpdateVendorProfileInput,
): Promise<VendorFullProfile> {
  return apiFetch<VendorFullProfile>("/vendor/profile", {
    method: "PATCH",
    token,
    body: patch,
  });
}

export async function changeVendorPassword(
  token: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  await apiFetch<void>("/vendor/change-password", {
    method: "POST",
    token,
    body: { currentPassword, newPassword },
  });
}

// --- Listings (CRUD under /vendor/listings) ---

export type VendorListingCategory = "cars" | "accommodations" | "experiences";
export type VendorListingStatus =
  | "draft"
  | "pending"
  | "live"
  | "paused"
  | "rejected";

export type VendorListingSummary = {
  id: string;
  category: VendorListingCategory;
  title: string;
  shortDescription?: string | null;
  location?: string | null;
  coverImageUrl?: string | null;
  status: VendorListingStatus;
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
};

export type VendorListingDetail = VendorListingSummary & {
  details: Record<string, unknown>;
  media: unknown[];
  availability?: Record<string, unknown> | null;
  rejectionReason?: string | null;
};

export type CreateVendorListingInput = {
  category: VendorListingCategory;
  title: string;
  shortDescription?: string;
  location?: string;
  coverImageUrl?: string;
  details?: Record<string, unknown>;
  media?: unknown[];
};

export async function listVendorListings(
  token: string,
): Promise<VendorListingSummary[]> {
  return apiFetch<VendorListingSummary[]>("/vendor/listings", { token });
}

export async function getVendorListing(
  token: string,
  id: string,
): Promise<VendorListingDetail> {
  return apiFetch<VendorListingDetail>(`/vendor/listings/${id}`, { token });
}

export async function createVendorListing(
  token: string,
  input: CreateVendorListingInput,
): Promise<VendorListingDetail> {
  return apiFetch<VendorListingDetail>("/vendor/listings", {
    method: "POST",
    token,
    body: input,
  });
}

export async function updateVendorListing(
  token: string,
  id: string,
  patch: Partial<CreateVendorListingInput>,
): Promise<VendorListingDetail> {
  return apiFetch<VendorListingDetail>(`/vendor/listings/${id}`, {
    method: "PATCH",
    token,
    body: patch,
  });
}

export async function setVendorListingStatus(
  token: string,
  id: string,
  status: "live" | "paused",
): Promise<VendorListingDetail> {
  return apiFetch<VendorListingDetail>(`/vendor/listings/${id}/status`, {
    method: "PATCH",
    token,
    body: { status },
  });
}

export async function setVendorListingAvailability(
  token: string,
  id: string,
  availability: Record<string, unknown>,
): Promise<VendorListingDetail> {
  return apiFetch<VendorListingDetail>(`/vendor/listings/${id}/availability`, {
    method: "PUT",
    token,
    body: { availability },
  });
}

export async function deleteVendorListing(
  token: string,
  id: string,
): Promise<void> {
  await apiFetch<void>(`/vendor/listings/${id}`, { method: "DELETE", token });
}

// --- Bookings (GET /vendor/bookings, PATCH :id/confirm|decline) ---

export type VendorBookingApi = {
  id: string;
  bookingReference: string;
  listingId?: string | null;
  listingTitle: string;
  listingImage?: string | null;
  productType?: string | null;
  experienceDate?: string | null;
  experienceTime?: string | null;
  guestCount: number;
  guestFirstName?: string | null;
  specialRequests?: string | null;
  carRentalMode?: string | null;
  deliveryAddress?: string | null;
  pickupAddress?: string | null;
  declineReason?: string | null;
  status:
    | "awaiting_confirmation"
    | "confirmed"
    | "declined"
    | "completed"
    | "cancelled";
  amount: number;
  currency: string;
  paymentSecured: boolean;
  respondBy?: string | null;
  createdAt: string;
};

export async function listVendorBookings(
  token: string,
): Promise<VendorBookingApi[]> {
  return apiFetch<VendorBookingApi[]>("/vendor/bookings", { token });
}

export async function confirmVendorBooking(
  token: string,
  id: string,
): Promise<VendorBookingApi> {
  return apiFetch<VendorBookingApi>(`/vendor/bookings/${id}/confirm`, {
    method: "PATCH",
    token,
  });
}

export async function declineVendorBooking(
  token: string,
  id: string,
  reason?: string,
): Promise<VendorBookingApi> {
  return apiFetch<VendorBookingApi>(`/vendor/bookings/${id}/decline`, {
    method: "PATCH",
    token,
    body: { reason },
  });
}

// --- Earnings (GET /vendor/earnings, /vendor/transactions, POST /vendor/payouts) ---

export type VendorEarnings = {
  availableBalance: number;
  lifetimeEarnings: number;
  currency: string;
  vendorSharePercent: number;
  platformSharePercent: number;
};

export type VendorTransactionApi = {
  id: string;
  title: string;
  description: string;
  date: string;
  amount: number;
  currency: string;
  type: "credit" | "debit";
  status: "completed" | "pending" | "failed";
};

export async function getVendorEarnings(
  token: string,
): Promise<VendorEarnings> {
  return apiFetch<VendorEarnings>("/vendor/earnings", { token });
}

export async function listVendorTransactions(
  token: string,
): Promise<VendorTransactionApi[]> {
  return apiFetch<VendorTransactionApi[]>("/vendor/transactions", { token });
}

export async function requestVendorPayout(
  token: string,
  amount: number,
  bankAccountId?: string,
): Promise<{ earnings: VendorEarnings; transaction: VendorTransactionApi }> {
  return apiFetch("/vendor/payouts", {
    method: "POST",
    token,
    body: { amount, bankAccountId },
  });
}

// --- Notifications (GET feed, PATCH read / read-all) ---

export type VendorNotificationApi = {
  id: string;
  type: string;
  title: string;
  message: string;
  href?: string | null;
  read: boolean;
  createdAt: string;
};

export async function listVendorNotifications(
  token: string,
): Promise<VendorNotificationApi[]> {
  return apiFetch<VendorNotificationApi[]>("/vendor/notifications", { token });
}

export async function markVendorNotificationRead(
  token: string,
  id: string,
): Promise<void> {
  await apiFetch<void>(`/vendor/notifications/${id}/read`, {
    method: "PATCH",
    token,
  });
}

export async function markAllVendorNotificationsRead(
  token: string,
): Promise<void> {
  await apiFetch<void>("/vendor/notifications/read-all", {
    method: "PATCH",
    token,
  });
}

// --- Documents (GET overview, POST upload a listing document) ---

export type DocStatus = "verified" | "pending" | "rejected" | "not_uploaded";

export type VendorBusinessDocApi = {
  id: string;
  type: string;
  label: string;
  fileName: string;
  fileUrl?: string | null;
  status: DocStatus;
  uploadedAt: string;
};

export type VendorListingDocApi = {
  id: string | null;
  type: string;
  label: string;
  status: DocStatus;
  fileName?: string;
  uploadedAt?: string;
  rejectionReason?: string | null;
};

export type VendorDocumentsOverview = {
  business: VendorBusinessDocApi[];
  listings: {
    listingId: string;
    title: string;
    category: string;
    reference?: string | null;
    documents: VendorListingDocApi[];
  }[];
};

export async function getVendorDocuments(
  token: string,
): Promise<VendorDocumentsOverview> {
  return apiFetch<VendorDocumentsOverview>("/vendor/documents", { token });
}

export async function uploadListingDocument(
  token: string,
  listingId: string,
  type: string,
  fileName: string,
): Promise<void> {
  await apiFetch<void>(`/vendor/listings/${listingId}/documents`, {
    method: "POST",
    token,
    body: { type, fileName },
  });
}
