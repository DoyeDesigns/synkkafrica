import { apiFetch } from "@/lib/api/backend";

// Mirrors the backend UserDto (GET/PATCH /users/profile).
export type UserProfile = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  profileImageUrl?: string | null;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

export async function getProfile(token: string): Promise<UserProfile> {
  const res = await apiFetch<{ user: UserProfile }>("/users/profile", { token });
  return res.user;
}

// Only these fields are mutable server-side; anything else is rejected (400).
export type UpdateProfileInput = {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profileImageUrl?: string;
};

export async function updateProfile(
  token: string,
  input: UpdateProfileInput,
): Promise<UserProfile> {
  const res = await apiFetch<{ user: UserProfile }>("/users/profile", {
    method: "PATCH",
    token,
    body: input,
  });
  return res.user;
}

// GDPR Art. 17 — cascades erasure of all PII. Idempotent (202 either way).
export async function requestErasure(token: string): Promise<void> {
  await apiFetch<unknown>("/users/me/erasure", { method: "POST", token });
}

// GDPR Art. 15/20 — full machine-readable export of everything we hold.
export async function exportMyData(token: string): Promise<unknown> {
  return apiFetch<unknown>("/users/me/export", { token });
}

// --- Customer bookings ---

export type CustomerBookingStatus = "upcoming" | "past" | "cancelled";

export type CustomerBookingApi = {
  id: string;
  orderNumber: string;
  orderDate: string;
  experienceDate: string | null;
  experienceTime: string | null;
  totalAmount: number;
  currency: string;
  title: string;
  description: string;
  location: string;
  image: string | null;
  rating: number;
  reviewCount: number;
  status: CustomerBookingStatus;
  rawStatus: string;
  guestCount: number;
  productType: string | null;
  listingId: string | null;
  paymentSecured: boolean;
  cancelledAt: string | null;
};

export async function listMyBookings(
  token: string,
): Promise<CustomerBookingApi[]> {
  return apiFetch<CustomerBookingApi[]>("/users/me/bookings", { token });
}

export async function cancelMyBooking(
  token: string,
  id: string,
): Promise<CustomerBookingApi> {
  return apiFetch<CustomerBookingApi>(`/users/me/bookings/${id}/cancel`, {
    method: "POST",
    token,
  });
}

// --- Saved listings (wishlist) ---

export type SavedListingApi = {
  savedId: string;
  listingId: string;
  category: "cars" | "accommodations" | "experiences";
  title: string;
  location: string | null;
  coverImageUrl: string | null;
  ratingAvg: number;
  ratingCount: number;
  savedAt: string;
};

export async function listMySaved(token: string): Promise<SavedListingApi[]> {
  return apiFetch<SavedListingApi[]>("/users/me/saved", { token });
}

export async function saveListing(
  token: string,
  listingId: string,
): Promise<{ saved: boolean }> {
  return apiFetch<{ saved: boolean }>(`/users/me/saved/${listingId}`, {
    method: "POST",
    token,
  });
}

export async function unsaveListing(
  token: string,
  listingId: string,
): Promise<{ saved: boolean }> {
  return apiFetch<{ saved: boolean }>(`/users/me/saved/${listingId}`, {
    method: "DELETE",
    token,
  });
}

// --- Notifications feed ---

export type UserNotificationApi = {
  id: string;
  type: string;
  title: string;
  message: string;
  href: string | null;
  read: boolean;
  createdAt: string;
};

export async function listMyNotifications(
  token: string,
): Promise<UserNotificationApi[]> {
  return apiFetch<UserNotificationApi[]>("/users/me/notifications", { token });
}

export async function markNotificationRead(
  token: string,
  id: string,
): Promise<void> {
  await apiFetch<void>(`/users/me/notifications/${id}/read`, {
    method: "PATCH",
    token,
  });
}

export async function markAllNotificationsRead(token: string): Promise<void> {
  await apiFetch<void>("/users/me/notifications/read-all", {
    method: "PATCH",
    token,
  });
}
