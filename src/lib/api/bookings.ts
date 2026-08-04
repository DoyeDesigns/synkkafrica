import { apiFetch } from "@/lib/api/backend";

// Matches the backend TravelerPiiDto / InlineTravelerDto.
export type TravelerInput = {
  title: "MR" | "MS" | "MRS" | "MISS" | "DR";
  firstName: string;
  lastName: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: "M" | "F";
  nationality: string; // ISO 3166-1 alpha-2
  passportNumber: string;
  passportExpiry: string; // YYYY-MM-DD
  passportIssuingCountry: string; // ISO 3166-1 alpha-2
  frequentFlyerProgram?: string;
  frequentFlyerNumber?: string;
};

export type BookingTravelerEntry =
  | { inline: TravelerInput }
  | {
      saved: {
        savedTravelerId: string;
        overrides?: Partial<TravelerInput>;
      };
    };

export type CreateBookingInput = {
  offerId: string;
  travelers: BookingTravelerEntry[];
  contactEmail: string;
  contactPhone?: string;
  paymentProvider?: "PAYSTACK" | "FLUTTERWAVE" | "STRIPE";
  acknowledgedTotalAmount?: string;
};

export type CreateBookingResult = {
  bookingId: string;
  state: string;
  authorizationUrl: string;
  amount: number;
  currency: string;
};

export type PriceChangedBody = {
  code: "PRICE_CHANGED";
  message: string;
  previousTotal: string;
  currentTotal: string;
  currency: string;
  confirmOfferId: string;
};

export function isPriceChanged(body: unknown): body is PriceChangedBody {
  return (
    typeof body === "object" &&
    body !== null &&
    (body as { code?: unknown }).code === "PRICE_CHANGED"
  );
}

export type BookingView = {
  id: string;
  state: string;
  pnr?: string | null;
  currency: string;
  totalAmount: number;
};

export type RequestBookingAccessInput = {
  bookingReference: string;
  email: string;
};

export type CancellationEstimate = {
  refundableAmount: number;
  nonRefundableAmount: number;
  currency: string;
  rationale: string;
  source: "live" | "snapshot";
};

export type CancelBookingInput = {
  reason?: string;
};

export type CancelBookingResult = {
  bookingId: string;
  state: string;
  refundId?: string | null;
  refundableAmount: number;
};

// POST /bookings
export async function createBooking(
  input: CreateBookingInput,
  token?: string,
): Promise<CreateBookingResult> {
  return apiFetch<CreateBookingResult>("/bookings", {
    method: "POST",
    token,
    body: input,
  });
}

// GET /bookings/:id
export async function getBooking(
  id: string,
  token?: string,
): Promise<BookingView> {
  return apiFetch<BookingView>(`/bookings/${id}`, { token });
}

// POST /bookings/request-access — always 200 (no enumeration).
export async function requestBookingAccess(
  input: RequestBookingAccessInput,
): Promise<void> {
  await apiFetch<void>("/bookings/request-access", {
    method: "POST",
    body: input,
  });
}

// POST /bookings/:id/resend-eticket
export async function resendBookingETicket(
  id: string,
  token?: string,
): Promise<void> {
  await apiFetch<void>(`/bookings/${id}/resend-eticket`, {
    method: "POST",
    token,
  });
}

// POST /bookings/:id/cancel/preview
export async function previewCancelBooking(
  id: string,
  token?: string,
): Promise<CancellationEstimate> {
  return apiFetch<CancellationEstimate>(`/bookings/${id}/cancel/preview`, {
    method: "POST",
    token,
  });
}

// PATCH /bookings/:id/cancel
export async function cancelBooking(
  id: string,
  input: CancelBookingInput = {},
  token?: string,
): Promise<CancelBookingResult> {
  return apiFetch<CancelBookingResult>(`/bookings/${id}/cancel`, {
    method: "PATCH",
    token,
    body: input,
  });
}
