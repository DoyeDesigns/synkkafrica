import { apiFetch } from "@/lib/api/backend";

// Marketplace (vendor) bookings: cars, stays, experiences. Flight bookings are
// in ./bookings.ts (GET /admin/bookings).

export type MarketplaceBookingStatus =
  | "awaiting_confirmation"
  | "confirmed"
  | "declined"
  | "completed"
  | "cancelled";

export type MarketplaceBooking = {
  id: string;
  bookingReference: string;
  productType: string | null; // car | accommodation | experience
  status: MarketplaceBookingStatus;
  listingId: string | null;
  listingTitle: string;
  listingImage: string | null;
  vendorId: string;
  vendorName: string | null;
  vendorEmail: string | null;
  vendorPhone: string | null;
  customerUserId: string | null;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  startDate: string | null; // YYYY-MM-DD
  startTime: string | null;
  endDate: string | null; // YYYY-MM-DD
  guestCount: number;
  roomName: string | null;
  roomCount: number;
  amount: number;
  subtotal: number;
  fees: number;
  currency: string;
  paymentSecured: boolean;
  paidAt: string | null;
  paymentProvider: string | null;
  chargeCurrency: string | null;
  chargeAmount: number | null;
  createdAt: string;
  updatedAt: string;
};

export type MarketplaceBookingDetail = MarketplaceBooking & {
  specialRequests: string | null;
  carRentalMode: string | null;
  pickupAddress: string | null;
  deliveryAddress: string | null;
  declineReason: string | null;
  respondBy: string | null;
  paymentReference: string | null;
  fxRate: number | null;
  ledger: Array<{
    id: string;
    type: string;
    status: string;
    amount: number;
    currency: string;
    title: string;
    occurredAt: string;
  }>;
  timeline: Array<{ label: string; at: string }>;
};

// GET /admin/marketplace-bookings — newest first, capped server-side.
export async function listMarketplaceBookings(
  token: string,
): Promise<MarketplaceBooking[]> {
  return apiFetch<MarketplaceBooking[]>("/admin/marketplace-bookings", {
    token,
  });
}

// GET /admin/marketplace-bookings/:id
export async function getMarketplaceBooking(
  token: string,
  id: string,
): Promise<MarketplaceBookingDetail> {
  return apiFetch<MarketplaceBookingDetail>(
    `/admin/marketplace-bookings/${id}`,
    { token },
  );
}

// POST /admin/marketplace-bookings/:id/cancel — only while awaiting the vendor.
export async function cancelMarketplaceBooking(
  token: string,
  id: string,
  reason?: string,
): Promise<{ id: string; status: "cancelled" }> {
  return apiFetch(`/admin/marketplace-bookings/${id}/cancel`, {
    method: "POST",
    token,
    body: reason ? { reason } : {},
  });
}
