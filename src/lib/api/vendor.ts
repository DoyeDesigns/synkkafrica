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
