export type AdminPeriod = "today" | "week" | "month";

export type AdminAlert = {
  id: string;
  messageKey:
    | "admin.dashboard.alert.pendingPayouts"
    | "admin.dashboard.alert.flaggedReview"
    | "admin.dashboard.alert.openTicket"
    | "admin.dashboard.alert.disabledVendor";
  href: string;
  severity: "info" | "warning" | "critical";
};

export type AdminDashboardMetrics = {
  bookings: Record<AdminPeriod, number>;
  revenue: Record<AdminPeriod, number>;
  currency: string;
  activeExperiences: number;
  activeVendors: number;
};

export const ADMIN_PERIOD_OPTIONS: AdminPeriod[] = ["today", "week", "month"];

export const ADMIN_DASHBOARD_METRICS: AdminDashboardMetrics = {
  bookings: { today: 18, week: 124, month: 512 },
  revenue: { today: 1_850_000, week: 12_400_000, month: 48_750_000 },
  currency: "NGN",
  activeExperiences: 86,
  activeVendors: 34,
};

export const ADMIN_DASHBOARD_ALERTS: AdminAlert[] = [
  {
    id: "alert-1",
    messageKey: "admin.dashboard.alert.pendingPayouts",
    href: "/admin/payouts",
    severity: "warning",
  },
  {
    id: "alert-2",
    messageKey: "admin.dashboard.alert.flaggedReview",
    href: "/admin/reviews",
    severity: "critical",
  },
  {
    id: "alert-3",
    messageKey: "admin.dashboard.alert.openTicket",
    href: "/admin/support",
    severity: "info",
  },
  {
    id: "alert-4",
    messageKey: "admin.dashboard.alert.disabledVendor",
    href: "/admin/vendors",
    severity: "warning",
  },
];
