import { apiFetch } from "@/lib/api/backend";

// Admin payouts (vendor withdrawal requests) — backend `admin/payouts`.

export type AdminPayoutRawStatus = "pending" | "completed" | "failed";
// `declined` = rejected by an admin; `failed` = failed any other way.
export type AdminPayoutDisplayStatus = "pending" | "completed" | "declined" | "failed";

export type AdminPayoutItem = {
  id: string;
  reference: string;
  vendorId: string;
  vendorName: string;
  vendorEmail: string | null;
  vendorPhone: string | null;
  categories: string[];
  amount: number;
  currency: string;
  status: AdminPayoutRawStatus;
  displayStatus: AdminPayoutDisplayStatus;
  requestTitle: string;
  requestedAt: string;
  // Start of the earnings window (the vendor's previous payout); null = since joining.
  periodStart: string | null;
  periodEnd: string;
  bankId: string | null;
  accountNumber: string | null;
  accountName: string | null;
  payoutMethod: "bank_transfer";
  bookingsCount: number;
  grossEarnings: number;
  commissionRate: number;
  commissionAmount: number;
  vendorShare: number;
};

export type AdminPayoutCurrencySummary = {
  currency: string;
  total: number;
  count: number;
  vendorCount: number;
  pending: number;
  pendingCount: number;
  completed: number;
  completedCount: number;
  declined: number;
  declinedCount: number;
  failed: number;
  failedCount: number;
};

export type AdminPayoutList = {
  items: AdminPayoutItem[];
  summaries: AdminPayoutCurrencySummary[];
};

export type AdminPayoutAssociatedBooking = {
  transactionId: string;
  bookingId: string | null;
  bookingReference: string | null;
  listingTitle: string;
  grossAmount: number;
  vendorShare: number;
  creditedAt: string;
};

export type AdminPayoutHistoryEntry = {
  id: string;
  action: "approved" | "declined" | "note";
  adminEmail: string | null;
  note: string | null;
  occurredAt: string;
};

export type AdminPayoutDetail = AdminPayoutItem & {
  associatedBookings: AdminPayoutAssociatedBooking[];
  history: AdminPayoutHistoryEntry[];
};

// GET /admin/payouts?from&to
export function listAdminPayouts(
  token: string,
  range: { from?: string; to?: string } = {},
): Promise<AdminPayoutList> {
  return apiFetch<AdminPayoutList>("/admin/payouts", { token, query: range });
}

// GET /admin/payouts/:id
export function getAdminPayout(token: string, id: string): Promise<AdminPayoutDetail> {
  return apiFetch<AdminPayoutDetail>(`/admin/payouts/${id}`, { token });
}

// POST /admin/payouts/:id/approve — mark paid.
export function approveAdminPayout(token: string, id: string): Promise<AdminPayoutDetail> {
  return apiFetch<AdminPayoutDetail>(`/admin/payouts/${id}/approve`, {
    method: "POST",
    token,
  });
}

// POST /admin/payouts/:id/decline — funds return to the vendor's balance.
export function declineAdminPayout(
  token: string,
  id: string,
  reason?: string,
): Promise<AdminPayoutDetail> {
  return apiFetch<AdminPayoutDetail>(`/admin/payouts/${id}/decline`, {
    method: "POST",
    token,
    body: reason ? { reason } : {},
  });
}

// POST /admin/payouts/:id/notes — internal admin note.
export function addAdminPayoutNote(
  token: string,
  id: string,
  note: string,
): Promise<AdminPayoutDetail> {
  return apiFetch<AdminPayoutDetail>(`/admin/payouts/${id}/notes`, {
    method: "POST",
    token,
    body: { note },
  });
}
