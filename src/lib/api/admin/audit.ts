import { apiFetch } from "@/lib/api/backend";

export type AuditModule =
  | "bookings"
  | "refunds"
  | "opsQueue"
  | "carrierCapability"
  | "markup"
  | "magicLinks"
  | "auth"
  | "reports";

export type AuditTargetType =
  | "BOOKING"
  | "REFUND"
  | "PAYMENT"
  | "OPS_QUEUE_ENTRY"
  | "CARRIER_CAPABILITY"
  | "MARKUP_CONFIG"
  | "MARKUP_OVERRIDE"
  | "MAGIC_LINK"
  | "TRAVELER_PII"
  | "ADMIN_USER"
  | "OTHER";

export type AuditListQuery = {
  adminId?: string;
  module?: AuditModule;
  action?: string;
  targetType?: AuditTargetType;
  targetId?: string;
  occurredSince?: string;
  occurredBefore?: string;
  limit?: number;
  offset?: number;
};

export type AuditEntry = {
  id: string;
  adminId: string;
  action: string;
  module: AuditModule;
  targetType?: AuditTargetType | null;
  targetId?: string | null;
  before?: unknown;
  after?: unknown;
  ip?: string | null;
  userAgent?: string | null;
  requestId?: string | null;
  occurredAt: string;
};

export type AuditListResponse = {
  items: AuditEntry[];
  total: number;
  limit: number;
  offset: number;
};

// GET /admin/audit-log
export async function listAuditLog(
  token: string,
  query: AuditListQuery = {},
): Promise<AuditListResponse> {
  return apiFetch<AuditListResponse>("/admin/audit-log", { token, query });
}
