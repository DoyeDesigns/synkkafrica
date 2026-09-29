"use server";

import { redirect } from "next/navigation";

import { signIn, signOut } from "@/auth";
import { requestOtp } from "@/lib/api/backend";

// Sign-out clears the session cookie (and fires the realm-aware backend revoke
// in auth.ts `events.signOut`) WITHOUT letting next-auth build the redirect.
// With `redirectTo`, next-auth turns the path into an absolute URL based on
// AUTH_URL / NEXTAUTH_URL (or the forwarded host); a wrong value there sends
// users to an unreachable host ("unable to connect"). Redirecting with a
// relative path via next/navigation always stays on the current origin.
async function signOutTo(path: string): Promise<never> {
  await signOut({ redirect: false });
  redirect(path);
}

export async function signOutAction() {
  await signOutTo("/");
}

// Module-specific sign-out: return the vendor/admin to their own login screen
// rather than the customer home.
export async function signOutVendorAction() {
  await signOutTo("/vendor/login");
}

export async function signOutAdminAction() {
  await signOutTo("/admin/login");
}

export async function signInWithGoogleAction() {
  await signIn("google", { redirectTo: "/" });
}

export async function signInWithAppleAction() {
  await signIn("apple", { redirectTo: "/" });
}

// Step 1 of passwordless login: ask the backend to email a 6-digit code.
// Always resolves (the backend never enumerates accounts); returns a flag so
// the UI can advance to the code-entry step.
export async function requestOtpAction(
  email: string,
): Promise<{ ok: boolean; error?: string }> {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) {
    return { ok: false, error: "Enter a valid email address." };
  }
  try {
    await requestOtp(trimmed);
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not send a code. Try again." };
  }
}
