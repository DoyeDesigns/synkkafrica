import { apiFetch } from "@/lib/api/backend";
import type { BackendTokens } from "@/lib/api/auth";

export type AdminMe = {
  id: string;
  email: string;
  isSuperAdmin: boolean;
  mfaEnrolled: boolean;
  lastLoginAt: string | null;
};

export type AdminLoginResult = {
  mfaTicket: string;
  enrollment?: Record<string, unknown>;
};

export type AdminVerifyMfaInput = {
  mfaTicket: string;
  totpCode: string;
};

// POST /admin/auth/login
export async function adminLogin(
  email: string,
  password: string,
): Promise<AdminLoginResult> {
  return apiFetch<AdminLoginResult>("/admin/auth/login", {
    body: { email, password },
  });
}

// POST /admin/auth/verify-mfa
export async function adminVerifyMfa(
  input: AdminVerifyMfaInput,
): Promise<BackendTokens> {
  return apiFetch<BackendTokens>("/admin/auth/verify-mfa", { body: input });
}

// POST /admin/auth/refresh-token
export async function adminRefreshTokens(
  refreshToken: string,
): Promise<BackendTokens> {
  return apiFetch<BackendTokens>("/admin/auth/refresh-token", {
    body: { refreshToken },
  });
}

// POST /admin/auth/logout
export async function adminLogout(refreshToken: string): Promise<void> {
  await apiFetch<void>("/admin/auth/logout", { body: { refreshToken } });
}

// GET /admin/auth/me
export async function getAdminMe(token: string): Promise<AdminMe> {
  return apiFetch<AdminMe>("/admin/auth/me", { token });
}
