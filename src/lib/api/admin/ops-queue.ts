import { apiFetch } from "@/lib/api/backend";

export type OpsQueueType =
  | "BOOKING_MANUAL_REVIEW"
  | "REFUND_FAILED"
  | "WEBHOOK_PROCESSING_FAILED"
  | "PROBE_CONFLICT"
  | "OTHER";

export type OpsQueueSeverity = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type OpsQueueEntry = {
  id: string;
  type: OpsQueueType;
  severity: OpsQueueSeverity;
  targetType: string;
  targetId: string;
  title: string;
  context?: unknown;
  claimedBy?: string | null;
  claimedAt?: string | null;
  resolvedBy?: string | null;
  resolvedAt?: string | null;
  resolution?: string | null;
  dismissedBy?: string | null;
  dismissedAt?: string | null;
  dismissReason?: string | null;
  createdAt: string;
};

export type OpsQueueListQuery = {
  type?: OpsQueueType;
  severity?: OpsQueueSeverity;
  claimedByMe?: boolean;
  unclaimed?: boolean;
  includeResolved?: boolean;
  limit?: number;
  offset?: number;
};

// GET /admin/ops-queue
export async function listOpsQueueEntries(
  token: string,
  query: OpsQueueListQuery = {},
): Promise<unknown> {
  return apiFetch<unknown>("/admin/ops-queue", { token, query });
}

// GET /admin/ops-queue/:id
export async function getOpsQueueEntry(
  token: string,
  id: string,
): Promise<OpsQueueEntry> {
  return apiFetch<OpsQueueEntry>(`/admin/ops-queue/${id}`, { token });
}

// POST /admin/ops-queue/:id/claim
export async function claimOpsQueueEntry(
  token: string,
  id: string,
): Promise<unknown> {
  return apiFetch<unknown>(`/admin/ops-queue/${id}/claim`, {
    method: "POST",
    token,
  });
}

// POST /admin/ops-queue/:id/release
export async function releaseOpsQueueEntry(
  token: string,
  id: string,
): Promise<unknown> {
  return apiFetch<unknown>(`/admin/ops-queue/${id}/release`, {
    method: "POST",
    token,
  });
}

// POST /admin/ops-queue/:id/resolve
export async function resolveOpsQueueEntry(
  token: string,
  id: string,
  resolution: string,
): Promise<unknown> {
  return apiFetch<unknown>(`/admin/ops-queue/${id}/resolve`, {
    method: "POST",
    token,
    body: { resolution },
  });
}

// POST /admin/ops-queue/:id/dismiss
export async function dismissOpsQueueEntry(
  token: string,
  id: string,
  dismissReason: string,
): Promise<unknown> {
  return apiFetch<unknown>(`/admin/ops-queue/${id}/dismiss`, {
    method: "POST",
    token,
    body: { dismissReason },
  });
}
