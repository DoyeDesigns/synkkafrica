export type AdminPeriod =
  | "today"
  | "week"
  | "month"
  | "sixMonths"
  | "year"
  | "all";

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
  users: Record<AdminPeriod, number>;
  revenue: Record<AdminPeriod, number>;
  currency: string;
  activeExperiences: number;
  activeVendors: number;
};

export const ADMIN_PERIOD_OPTIONS: AdminPeriod[] = [
  "today",
  "week",
  "month",
  "sixMonths",
  "year",
  "all",
];

export const ADMIN_DASHBOARD_METRICS: AdminDashboardMetrics = {
  users: {
    today: 42,
    week: 310,
    month: 1_240,
    sixMonths: 6_800,
    year: 14_200,
    all: 18_500,
  },
  revenue: {
    today: 1_850_000,
    week: 12_400_000,
    month: 48_750_000,
    sixMonths: 210_000_000,
    year: 420_000_000,
    all: 512_000_000,
  },
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
