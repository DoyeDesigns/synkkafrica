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
