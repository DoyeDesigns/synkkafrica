import { apiFetch } from "@/lib/api/backend";

// Matches the backend TravelerPiiDto.
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

export type CreateBookingInput = {
  offerId: string;
  travelers: TravelerInput[];
  contactEmail: string;
  contactPhone?: string;
  // Echo the 409 `currentTotal` here to confirm a changed fare and proceed.
  acknowledgedTotalAmount?: string;
};

export type CreateBookingResult = {
  bookingId: string;
  state: string;
  authorizationUrl: string;
  amount: number;
  currency: string;
};

// Body of the 409 the backend returns when the fare moved since search.
export type PriceChangedBody = {
  code: "PRICE_CHANGED";
  message: string;
  previousTotal: string;
  currentTotal: string;
  currency: string;
  // The fresh, orderable offer priced at 409-time. Echo this back as `offerId`
  // (with acknowledgedTotalAmount) to book exactly this fare on confirm.
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

// Reads a booking's current state. Requires the owner's session token (or a
// magic-link, not used here) — so this is for logged-in customers.
export async function getBooking(
  id: string,
  token: string,
): Promise<BookingView> {
  return apiFetch<BookingView>(`/bookings/${id}`, { token });
}

// Creates a booking and returns the hosted-checkout URL to redirect to.
// Guest checkout is allowed; pass the session token when logged in.
export async function createBooking(
  input: CreateBookingInput,
  token?: string,
): Promise<CreateBookingResult> {
  return apiFetch<CreateBookingResult>("/bookings", {
    method: "POST",
    token,
    body: {
      offerId: input.offerId,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone,
      acknowledgedTotalAmount: input.acknowledgedTotalAmount,
      travelers: input.travelers.map((t) => ({ inline: t })),
    },
  });
}
