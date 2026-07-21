import { auth } from "@/auth";
import { getAdminDesignPreviewSession } from "@/features/account/preview";
import type { Session } from "next-auth";

export async function getAdminSession(): Promise<Session | null> {
  const previewSession = getAdminDesignPreviewSession();

  if (previewSession) {
    return previewSession;
  }

  return auth();
}
