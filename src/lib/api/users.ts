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
