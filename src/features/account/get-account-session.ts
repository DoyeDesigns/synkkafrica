import { auth } from "@/auth";
import {
  getAccountDesignPreviewSession,
  isAccountDesignPreviewEnabled,
} from "@/features/account/preview";
import type { Session } from "next-auth";

export async function getAccountSession(): Promise<Session | null> {
  // A real signed-in session always wins — otherwise the design-preview
  // fallback (dev-only) would mask the logged-in user's token and make the
  // profile read-only. Preview only fills in when nobody is signed in.
  const realSession = await auth();
  if (realSession?.user) {
    return realSession;
  }

  return getAccountDesignPreviewSession();
}

export async function requireAccountSession(): Promise<Session> {
  const session = await getAccountSession();

  if (!session?.user) {
    throw new Error("Account session required");
  }

  return session;
}

export { isAccountDesignPreviewEnabled };
