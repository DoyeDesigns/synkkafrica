import { apiFetch } from "@/lib/api/backend";

export type BookingState =
  | "DRAFT"
  | "SEARCHED"
  | "PRICE_CONFIRMING"
  | "PRICE_CONFIRMED"
  | "PRICE_EXPIRED"
  | "PNR_HOLD_CREATING"
  | "PNR_HELD"
  | "PNR_HOLD_FAILED"
  | "PNR_HOLD_EXPIRED"
  | "PAYMENT_PENDING"
  | "PAYMENT_AUTHORIZED"
  | "PAYMENT_CONFIRMED"
  | "PAYMENT_FAILED"
  | "PNR_CREATING"
  | "PNR_CREATED"
  | "PNR_FAILED_REFUND_PENDING"
  | "TICKETING_QUEUED"
  | "TICKETING_IN_PROGRESS"
  | "TICKETED"
  | "TICKETING_FAILED"
  | "REFUND_PROCESSING"
  | "REFUNDED"
  | "CANCELLED"
  | "MANUAL_REVIEW_REQUIRED";

export type PaymentProvider = "PAYSTACK" | "FLUTTERWAVE" | "STRIPE";

export type FulfillmentStrategy =
  | "CHARGE_THEN_PNR_THEN_REFUND_ON_FAIL"
  | "PNR_HOLD_THEN_CHARGE"
  | "AUTH_ONLY_THEN_CAPTURE";

export type AdminBookingListQuery = {
  state?: BookingState;
  paymentProvider?: PaymentProvider;
  fulfillmentStrategy?: FulfillmentStrategy;
  customerEmail?: string;
  pnr?: string;
  bookingReference?: string;
  createdSince?: string;
  createdBefore?: string;
  limit?: number;
  offset?: number;
};

export type AdminCancelBookingInput = {
  reason: string;
  refundOverrideAmount?: number;
};

export type AdminForceStateInput = {
  targetState: BookingState;
  reason: string;
};

// GET /admin/bookings
export async function listAdminBookings(
  token: string,
  query: AdminBookingListQuery = {},
): Promise<unknown> {
  return apiFetch<unknown>("/admin/bookings", { token, query });
}

// GET /admin/bookings/:id
export async function getAdminBooking(
  token: string,
  id: string,
): Promise<unknown> {
  return apiFetch<unknown>(`/admin/bookings/${id}`, { token });
}

// POST /admin/bookings/:id/cancel
export async function adminCancelBooking(
  token: string,
  id: string,
  input: AdminCancelBookingInput,
): Promise<unknown> {
  return apiFetch<unknown>(`/admin/bookings/${id}/cancel`, {
    method: "POST",
    token,
    body: input,
  });
}

// POST /admin/bookings/:id/magic-link/revoke-all
export async function revokeAllBookingMagicLinks(
  token: string,
  id: string,
): Promise<unknown> {
  return apiFetch<unknown>(`/admin/bookings/${id}/magic-link/revoke-all`, {
    method: "POST",
    token,
  });
}

// POST /admin/bookings/:id/retry
export async function retryAdminBooking(
  token: string,
  id: string,
): Promise<unknown> {
  return apiFetch<unknown>(`/admin/bookings/${id}/retry`, {
    method: "POST",
    token,
  });
}

// POST /admin/bookings/:id/force-state
export async function forceAdminBookingState(
  token: string,
  id: string,
  input: AdminForceStateInput,
): Promise<unknown> {
  return apiFetch<unknown>(`/admin/bookings/${id}/force-state`, {
    method: "POST",
    token,
    body: input,
  });
}
