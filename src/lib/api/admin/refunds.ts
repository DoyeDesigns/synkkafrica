import { apiFetch } from "@/lib/api/backend";

export type RefundStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
export type RefundInitiatedBy = "SYSTEM" | "CUSTOMER" | "ADMIN";

export type AdminRefundListQuery = {
  status?: RefundStatus;
  provider?: "PAYSTACK" | "FLUTTERWAVE" | "STRIPE";
  bookingId?: string;
  initiatedBy?: RefundInitiatedBy;
  createdSince?: string;
  createdBefore?: string;
  limit?: number;
  offset?: number;
};

export type AdHocRefundInput = {
  bookingId: string;
  amount: number;
  reason: string;
};

export type MarkRefundResolvedInput = {
  providerRefundId: string;
  notes: string;
};

// GET /admin/refunds
export async function listAdminRefunds(
  token: string,
  query: AdminRefundListQuery = {},
): Promise<unknown> {
  return apiFetch<unknown>("/admin/refunds", { token, query });
}

// GET /admin/refunds/:id
export async function getAdminRefund(
  token: string,
  id: string,
): Promise<unknown> {
  return apiFetch<unknown>(`/admin/refunds/${id}`, { token });
}

// POST /admin/refunds/:id/retry
export async function retryAdminRefund(
  token: string,
  id: string,
): Promise<unknown> {
  return apiFetch<unknown>(`/admin/refunds/${id}/retry`, {
    method: "POST",
    token,
  });
}

// POST /admin/refunds/ad-hoc
export async function createAdHocRefund(
  token: string,
  input: AdHocRefundInput,
): Promise<unknown> {
  return apiFetch<unknown>("/admin/refunds/ad-hoc", {
    method: "POST",
    token,
    body: input,
  });
}

// POST /admin/refunds/:id/mark-resolved-externally
export async function markRefundResolvedExternally(
  token: string,
  id: string,
  input: MarkRefundResolvedInput,
): Promise<unknown> {
  return apiFetch<unknown>(`/admin/refunds/${id}/mark-resolved-externally`, {
    method: "POST",
    token,
    body: input,
  });
}
