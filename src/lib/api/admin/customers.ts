import { apiFetch } from "@/lib/api/backend";

// Admin read side for CUSTOMER accounts (not admin staff — see ./users.ts).

export type CurrencyAmount = { currency: string; amount: number };

export type AdminCustomerActivity = {
  userId: string;
  bookingsCount: number;
  // Lifetime spend per currency, largest first. Never summed across currencies.
  spend: CurrencyAmount[];
  lastBookingAt: string | null;
};

// GET /admin/customers/activity — one row per customer with a paid booking.
export async function adminListCustomerActivity(
  token: string,
): Promise<AdminCustomerActivity[]> {
  return apiFetch<AdminCustomerActivity[]>("/admin/customers/activity", {
    token,
  });
}

export type AdminCustomerBooking = {
  id: string;
  kind: "flight" | "car" | "accommodation" | "experience" | "other";
  reference: string;
  title: string;
  status: string;
  amount: number;
  currency: string;
  paid: boolean;
  serviceDate: string | null;
  createdAt: string;
  vendorId: string | null;
  listingId: string | null;
};

export type AdminCustomerTicket = {
  id: string;
  reference: number;
  subject: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: string;
  createdAt: string;
};

export type AdminCustomerDetail = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  profileImageUrl: string | null;
  emailVerified: boolean;
  deleted: boolean;
  erasureRequestedAt: string | null;
  disabledAt: string | null;
  disabledReason: string | null;
  createdAt: string;
  lastSignInAt: string | null;
  bookingsCount: number;
  spend: CurrencyAmount[];
  lastBookingAt: string | null;
  reviewsCount: number;
  openTickets: number;
  tickets: AdminCustomerTicket[];
  bookings: AdminCustomerBooking[];
};

// GET /admin/customers/:id
export async function adminGetCustomer(
  token: string,
  id: string,
): Promise<AdminCustomerDetail> {
  return apiFetch<AdminCustomerDetail>(`/admin/customers/${id}`, { token });
}
