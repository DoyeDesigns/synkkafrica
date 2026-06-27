import { auth } from "@/auth";
import {
  getAccountDesignPreviewSession,
  isAccountDesignPreviewEnabled,
} from "@/features/account/preview";
import type { Session } from "next-auth";

export async function getAccountSession(): Promise<Session | null> {
  const previewSession = getAccountDesignPreviewSession();

  if (previewSession) {
    return previewSession;
  }

  return auth();
}

export async function requireAccountSession(): Promise<Session> {
  const session = await getAccountSession();

  if (!session?.user) {
    throw new Error("Account session required");
  }

  return session;
}

export { isAccountDesignPreviewEnabled };
