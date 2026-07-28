"use server";

import { signIn, signOut } from "@/auth";
import { requestOtp } from "@/lib/api/backend";

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

export async function signInWithGoogleAction() {
  await signIn("google", { redirectTo: "/" });
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
