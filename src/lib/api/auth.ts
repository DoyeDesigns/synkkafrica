import { apiFetch } from "@/lib/api/backend";

export type BackendTokens = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number; // seconds
  refreshTokenExpiresIn: number; // seconds
};

// POST /auth/request-otp — always 204 (no account enumeration).
export async function requestOtp(email: string): Promise<void> {
  await apiFetch<void>("/auth/request-otp", { body: { email } });
}

// POST /auth/verify-otp — first verification signs up; later ones log in.
export async function verifyOtp(
  email: string,
  code: string,
): Promise<BackendTokens> {
  return apiFetch<BackendTokens>("/auth/verify-otp", { body: { email, code } });
}

// POST /auth/refresh — rotate the refresh token.
export async function refreshTokens(
  refreshToken: string,
): Promise<BackendTokens> {
  return apiFetch<BackendTokens>("/auth/refresh", { body: { refreshToken } });
}

// POST /auth/signout — idempotent revoke of the refresh token.
export async function signOutBackend(refreshToken: string): Promise<void> {
  await apiFetch<void>("/auth/signout", { body: { refreshToken } });
}
