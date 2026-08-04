import { apiFetch } from "@/lib/api/backend";

export type PrivacyNotice = {
  version: string;
  markdown: string;
  plaintext: string;
};

// GET /legal/privacy — public, unauthenticated.
export async function getPrivacyNotice(
  signal?: AbortSignal,
): Promise<PrivacyNotice> {
  return apiFetch<PrivacyNotice>("/legal/privacy", { signal });
}
