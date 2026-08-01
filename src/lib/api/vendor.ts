import { apiFetch, type BackendTokens } from "@/lib/api/backend";
import type {
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketStatus,
} from "@/features/vendor/data/vendor-support";

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
  governmentIdFileUrl?: string;
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
  // When true the backend stores it with status `draft` (private to the
  // vendor) instead of submitting it for admin review (`pending`).
  saveAsDraft?: boolean;
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

// Submit a draft (or rejected) listing for admin review → status `pending`.
export async function submitVendorListing(
  token: string,
  id: string,
): Promise<VendorListingDetail> {
  return apiFetch<VendorListingDetail>(`/vendor/listings/${id}/submit`, {
    method: "PATCH",
    token,
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
  id: string | null;
  type: string;
  label: string;
  fileName?: string;
  fileUrl?: string | null;
  status: DocStatus;
  uploadedAt?: string;
  rejectionReason?: string | null;
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
  fileUrl?: string,
): Promise<void> {
  await apiFetch<void>(`/vendor/listings/${listingId}/documents`, {
    method: "POST",
    token,
    body: { type, fileName, fileUrl },
  });
}

// Upload / replace a business KYC document (government_id, cac_certificate,
// proof_of_address).
export async function uploadBusinessDocument(
  token: string,
  type: string,
  fileName: string,
  fileUrl?: string,
): Promise<void> {
  await apiFetch<void>("/vendor/documents", {
    method: "POST",
    token,
    body: { type, fileName, fileUrl },
  });
}

// --- Direct-to-storage uploads (GCS presigned PUT) ---

export type VendorUploadKind =
  | "listing-media"
  | "listing-document"
  | "cac"
  | "government-id"
  | "proof-of-address";

export type SignedUpload = {
  uploadUrl: string;
  objectPath: string;
  publicUrl: string | null;
};

// Some browser File objects have an empty `.type`; derive a MIME from the
// extension so the value we sign matches what we PUT (the signature binds it).
function resolveContentType(file: File): string {
  if (file.type) return file.type;
  switch (file.name.toLowerCase().split(".").pop()) {
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "webp":
      return "image/webp";
    case "mp4":
      return "video/mp4";
    case "pdf":
      return "application/pdf";
    default:
      return "application/octet-stream";
  }
}

export async function signVendorUpload(
  token: string,
  input: { kind: VendorUploadKind; fileName: string; contentType: string },
): Promise<SignedUpload> {
  return apiFetch<SignedUpload>("/vendor/uploads/sign", {
    method: "POST",
    token,
    body: input,
  });
}

// Sign, then PUT the raw bytes straight to storage (NOT through apiFetch — the
// presigned URL points at the bucket and must not carry our auth headers).
// Returns the stable public URL (for public kinds) and the object path.
export async function uploadVendorFile(
  token: string,
  kind: VendorUploadKind,
  file: File,
): Promise<{ url: string | null; objectPath: string }> {
  const contentType = resolveContentType(file);
  const signed = await signVendorUpload(token, {
    kind,
    fileName: file.name,
    contentType,
  });
  const res = await fetch(signed.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file,
  });
  if (!res.ok) {
    throw new Error(`Upload failed (${res.status})`);
  }
  return { url: signed.publicUrl, objectPath: signed.objectPath };
}

// Government-ID upload during signup — authorized by the signup token since no
// vendor account exists yet. Returns the storage objectPath to submit on signup.
export async function uploadVendorSignupFile(
  signupToken: string,
  file: File,
): Promise<{ objectPath: string }> {
  const contentType = resolveContentType(file);
  const signed = await apiFetch<{ uploadUrl: string; objectPath: string }>(
    "/vendor/auth/signup/sign-upload",
    { method: "POST", body: { signupToken, fileName: file.name, contentType } },
  );
  const res = await fetch(signed.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file,
  });
  if (!res.ok) {
    throw new Error(`Upload failed (${res.status})`);
  }
  return { objectPath: signed.objectPath };
}

// --- Support tickets ---

export type SupportTicketApi = {
  id: string;
  ticketNumber: string;
  subject: string;
  category: SupportTicketCategory;
  priority: SupportTicketPriority;
  description: string;
  status: SupportTicketStatus;
  bookingReference: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SupportTicketMessageApi = {
  id: string;
  authorRole: "vendor" | "admin";
  body: string;
  createdAt: string;
};

export type SupportTicketDetailApi = SupportTicketApi & {
  messages: SupportTicketMessageApi[];
};

export type CreateSupportTicketBody = {
  subject: string;
  category: SupportTicketCategory;
  priority: SupportTicketPriority;
  description: string;
  bookingReference?: string;
};

export async function listSupportTickets(
  token: string,
): Promise<SupportTicketApi[]> {
  return apiFetch<SupportTicketApi[]>("/vendor/support/tickets", { token });
}

export async function createSupportTicket(
  token: string,
  body: CreateSupportTicketBody,
): Promise<SupportTicketDetailApi> {
  return apiFetch<SupportTicketDetailApi>("/vendor/support/tickets", {
    method: "POST",
    token,
    body,
  });
}

export async function getSupportTicket(
  token: string,
  id: string,
): Promise<SupportTicketDetailApi> {
  return apiFetch<SupportTicketDetailApi>(`/vendor/support/tickets/${id}`, {
    token,
  });
}

export async function replySupportTicket(
  token: string,
  id: string,
  body: string,
): Promise<SupportTicketDetailApi> {
  return apiFetch<SupportTicketDetailApi>(
    `/vendor/support/tickets/${id}/messages`,
    { method: "POST", token, body: { body } },
  );
}
