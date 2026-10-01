"use server";

import { signIn } from "@/auth";
import { ApiError } from "@/lib/api/backend";
import {
  requestVendorOtp,
  requestVendorPasswordReset,
  resetVendorPassword,
  signupVendor,
  verifyVendorOtp,
  type VendorSignupInput,
} from "@/lib/api/vendor";
import {
  ACCOUNT_BLOCKED_SIGNIN_CODE,
  SIGNIN_UNAVAILABLE_CODE,
} from "@/lib/auth/session-errors";

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
  } catch (err) {
    // The vendor credentials provider tags failures that aren't a wrong
    // password (see src/auth.ts) with a `code`.
    const code = (err as { code?: string } | null)?.code;
    if (code === ACCOUNT_BLOCKED_SIGNIN_CODE) {
      return {
        ok: false,
        error: "This vendor account is suspended. Contact SynkAfrica support.",
      };
    }
    if (code === SIGNIN_UNAVAILABLE_CODE) {
      return {
        ok: false,
        error: "We couldn't sign you in right now. Please try again in a moment.",
      };
    }
    return { ok: false, error: "Invalid email or password." };
  }
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
    // The browser only ever sees a display string, so without this the real
    // cause (a backend 4xx/5xx, or the fetch itself failing) is invisible.
    // Server actions log to the platform, so this is the only breadcrumb.
    console.error("[vendor-signup] failed", {
      status: err instanceof ApiError ? err.status : null,
      message: err instanceof Error ? err.message : String(err),
    });
    if (err instanceof ApiError && err.status === 409) {
      return { ok: false, error: "An account with this email already exists." };
    }
    if (err instanceof ApiError && err.status === 401) {
      return {
        ok: false,
        error: "Email verification expired — resend the code.",
      };
    }
    // 400s are validation failures the vendor can actually act on (bad phone
    // format, email mismatch), so pass the backend's message straight through.
    if (err instanceof ApiError && err.status === 400) {
      return { ok: false, error: err.message };
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

// Forgot-password outcomes carry an error *code* (not a display string) so the
// client can translate it; `message` is the backend's own validation text for
// 400s, which the vendor can act on directly.
export type VendorPasswordResetResult =
  | { ok: true }
  | {
      ok: false;
      error:
        | "invalidEmail"
        | "sendFailed"
        | "invalidCode"
        | "validation"
        | "resetFailed";
      message?: string;
    };

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Nest's ValidationPipe returns `message` as a string or an array of strings.
function backendMessage(err: ApiError): string {
  const body = err.body;
  if (body && typeof body === "object" && "message" in body) {
    const message = (body as { message: unknown }).message;
    if (Array.isArray(message)) return message.map(String).join(" ");
    if (typeof message === "string") return message;
  }
  return err.message;
}

// Forgot password step 1: email a reset code. The backend always answers 204
// whether or not the account exists, so success says nothing about the email.
export async function requestVendorPasswordResetAction(
  email: string,
): Promise<VendorPasswordResetResult> {
  const trimmed = email.trim().toLowerCase();
  if (!EMAIL_RE.test(trimmed)) return { ok: false, error: "invalidEmail" };
  try {
    await requestVendorPasswordReset(trimmed);
    return { ok: true };
  } catch (err) {
    console.error("[vendor-forgot-password] failed", {
      status: err instanceof ApiError ? err.status : null,
      message: err instanceof Error ? err.message : String(err),
    });
    return { ok: false, error: "sendFailed" };
  }
}

// Forgot password step 2: consume the code and set the new password.
export async function resetVendorPasswordAction(input: {
  email: string;
  code: string;
  newPassword: string;
}): Promise<VendorPasswordResetResult> {
  const email = input.email.trim().toLowerCase();
  const code = input.code.trim();
  if (!EMAIL_RE.test(email)) return { ok: false, error: "invalidEmail" };
  if (!/^\d{6}$/.test(code)) return { ok: false, error: "invalidCode" };
  try {
    await resetVendorPassword({ email, code, newPassword: input.newPassword });
    return { ok: true };
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      return { ok: false, error: "invalidCode" };
    }
    if (err instanceof ApiError && err.status === 400) {
      return { ok: false, error: "validation", message: backendMessage(err) };
    }
    console.error("[vendor-reset-password] failed", {
      status: err instanceof ApiError ? err.status : null,
      message: err instanceof Error ? err.message : String(err),
    });
    return { ok: false, error: "resetFailed" };
  }
}
