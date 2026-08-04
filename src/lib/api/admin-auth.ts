import { apiFetch, type BackendTokens } from "@/lib/api/backend";

// Admin login is a 2-step MFA flow: password → mfaTicket → TOTP code → tokens.

export type AdminEnrollment = {
  secret: string;
  otpauthUrl: string;
};

export type AdminLoginResult = {
  mfaTicket: string;
  // Present on first login — scan the otpauthUrl (or enter `secret`) into an
  // authenticator app, then submit a code to verify-mfa to finish enrollment.
  enrollment?: AdminEnrollment;
};

export type AdminMe = {
  id: string;
  email: string;
  isSuperAdmin: boolean;
  mfaEnrolled: boolean;
};

// Step 1 — verify email + password, get a short-lived single-use mfaTicket.
export async function loginAdmin(
  email: string,
  password: string,
): Promise<AdminLoginResult> {
  return apiFetch<AdminLoginResult>("/admin/auth/login", {
    body: { email, password },
  });
}

// Step 2 — consume the ticket + TOTP code, get admin-realm tokens.
export async function verifyAdminMfa(
  mfaTicket: string,
  totpCode: string,
): Promise<BackendTokens> {
  return apiFetch<BackendTokens>("/admin/auth/verify-mfa", {
    body: { mfaTicket, totpCode },
  });
}

export async function refreshAdminTokens(
  refreshToken: string,
): Promise<BackendTokens> {
  return apiFetch<BackendTokens>("/admin/auth/refresh-token", {
    body: { refreshToken },
  });
}

export async function getAdminMe(token: string): Promise<AdminMe> {
  return apiFetch<AdminMe>("/admin/auth/me", { token });
}

// Accept an admin invite: consume the emailed token and set a password to
// create the account. Public (no token required).
export async function acceptAdminInvite(
  token: string,
  password: string,
): Promise<{ email: string }> {
  return apiFetch<{ email: string }>("/admin/auth/accept-invite", {
    body: { token, password },
  });
}
