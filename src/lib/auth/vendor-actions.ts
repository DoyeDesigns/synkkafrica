"use server";

import { signIn } from "@/auth";
import { ApiError } from "@/lib/api/backend";
import {
  requestVendorOtp,
  signupVendor,
  verifyVendorOtp,
  type VendorSignupInput,
} from "@/lib/api/vendor";

const VENDOR_REDIRECT = "/vendor";

export type VendorActionResult = { ok: boolean; error?: string };

// Signup outcome: on success, `next` says where to route (auto-login landed
// them in the dashboard, or the account was created but they must log in).
// `error` stays purely a display string.
export type VendorSignupResult =
  | { ok: true; next: "dashboard" | "login" }
  | { ok: false; error: string };

// Email + password login. Returns a result object (redirect: false) so the
// multi-field form can show an inline error instead of NextAuth's error page.
export async function signInWithEmailAsVendorAction(
  _prev: VendorActionResult | undefined,
  formData: FormData,
): Promise<VendorActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return { ok: false, error: "Enter your email and password." };
  }
  try {
    await signIn("vendor", { email, password, redirect: false });
    return { ok: true };
  } catch {
    // Credentials provider throws on bad login.
    return { ok: false, error: "Invalid email or password." };
  }
}

export async function signInWithGoogleAsVendorAction() {
  await signIn("google", { redirectTo: VENDOR_REDIRECT });
}

// Signup step: email the verification code.
export async function requestVendorOtpAction(
  email: string,
): Promise<VendorActionResult> {
  const trimmed = email.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) {
    return { ok: false, error: "Enter a valid email address." };
  }
  try {
    await requestVendorOtp(trimmed);
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not send a code. Try again." };
  }
}

// Signup step: verify the code, returning the signup token to carry to submit.
export async function verifyVendorOtpAction(
  email: string,
  code: string,
): Promise<{ ok: boolean; signupToken?: string; error?: string }> {
  try {
    const { signupToken } = await verifyVendorOtp(
      email.trim().toLowerCase(),
      code,
    );
    return { ok: true, signupToken };
  } catch {
    return { ok: false, error: "That code is invalid or expired." };
  }
}

// Final signup submit: create the vendor, then establish the NextAuth session
// via the vendor credentials provider (the password was just set).
export async function signUpVendorAction(
  input: VendorSignupInput,
): Promise<VendorSignupResult> {
  try {
    await signupVendor(input);
  } catch (err) {
    if (err instanceof ApiError && err.status === 409) {
      return { ok: false, error: "An account with this email already exists." };
    }
    if (err instanceof ApiError && err.status === 401) {
      return {
        ok: false,
        error: "Email verification expired — resend the code.",
      };
    }
    return { ok: false, error: "Could not create your account. Try again." };
  }
  try {
    await signIn("vendor", {
      email: input.email,
      password: input.password,
      redirect: false,
    });
    return { ok: true, next: "dashboard" };
  } catch {
    // Account created but auto-login failed — send them to log in.
    return { ok: true, next: "login" };
  }
}
