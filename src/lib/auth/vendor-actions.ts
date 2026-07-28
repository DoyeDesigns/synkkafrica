"use server";

import { signIn } from "@/auth";

const VENDOR_REDIRECT = "/vendor";

export async function signInWithEmailAsVendorAction(formData: FormData) {
  const email = formData.get("email");

  if (typeof email !== "string" || !email) {
    return;
  }

  await signIn("email", { email, redirectTo: VENDOR_REDIRECT });
}

export async function signInWithGoogleAsVendorAction() {
  await signIn("google", { redirectTo: VENDOR_REDIRECT });
}
