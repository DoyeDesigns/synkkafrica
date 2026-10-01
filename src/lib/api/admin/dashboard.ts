import { apiFetch } from "@/lib/api/backend";

export const ADMIN_DASHBOARD_PERIODS = [
  "today",
  "week",
  "month",
  "sixMonths",
  "year",
  "all",
] as const;
export type AdminDashboardPeriod = (typeof ADMIN_DASHBOARD_PERIODS)[number];

export const ADMIN_DASHBOARD_RANGES = ["7d", "30d", "90d", "12m"] as const;
export type AdminDashboardRange = (typeof ADMIN_DASHBOARD_RANGES)[number];

export type AdminRevenueByCurrency = {
  currency: string;
  // Paid marketplace bookings (cars / stays / experiences), major units.
  marketplace: number;
  // Ticketed flights, major units.
  flights: number;
  total: number;
};

export type AdminDashboardKpis = {
  period: AdminDashboardPeriod;
  from: string | null;
  to: string;
  users: { newInPeriod: number; total: number };
  bookings: { marketplace: number; flights: number; total: number };
  // One entry per currency, largest first. Never summed across currencies.
  revenue: AdminRevenueByCurrency[];
  activeExperiences: number;
  activeVendors: number;
};

export type AdminDashboardAlerts = {
  pendingPayouts: number;
  openSupportTickets: number;
  suspendedVendors: number;
  pendingVendors: number;
  pendingListings: {
    cars: number;
    accommodations: number;
    experiences: number;
  };
  pendingDocuments: number;
  awaitingBookings: number;
};

export type AdminDashboardSeries = {
  range: AdminDashboardRange;
  from: string;
  to: string;
  unit: "day" | "month";
  points: Array<{
    // UTC bucket start, e.g. "2026-10-01T00:00:00Z".
    bucket: string;
    bookings: number;
    revenue: Array<{ currency: string; amount: number }>;
  }>;
};

// GET /admin/dashboard/kpis
export async function adminGetDashboardKpis(
  token: string,
  period: AdminDashboardPeriod,
): Promise<AdminDashboardKpis> {
  return apiFetch<AdminDashboardKpis>("/admin/dashboard/kpis", {
    token,
    query: { period },
  });
}

// GET /admin/dashboard/alerts
export async function adminGetDashboardAlerts(
  token: string,
): Promise<AdminDashboardAlerts> {
  return apiFetch<AdminDashboardAlerts>("/admin/dashboard/alerts", { token });
}

// GET /admin/dashboard/series
export async function adminGetDashboardSeries(
  token: string,
  range: AdminDashboardRange,
): Promise<AdminDashboardSeries> {
  return apiFetch<AdminDashboardSeries>("/admin/dashboard/series", {
    token,
    query: { range },
  });
}
