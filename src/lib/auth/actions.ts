"use server";

import { signIn, signOut } from "@/auth";

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

export async function signInWithEmailAction(formData: FormData) {
  const email = formData.get("email");

  if (typeof email !== "string" || !email) {
    return;
  }

  await signIn("email", { email, redirectTo: "/" });
}

export async function signInWithGoogleAction() {
  await signIn("google", { redirectTo: "/" });
}
