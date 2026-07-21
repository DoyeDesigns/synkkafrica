export const ADMIN_AREA_PREFIX = "/admin";

export type AdminNavItem = {
  id: string;
  href: string;
  icon:
    | "dashboard"
    | "experiences"
    | "vendors"
    | "bookings"
    | "payouts"
    | "reviews"
    | "reports"
    | "support";
  badge?: number;
};

export const ADMIN_NAV: AdminNavItem[] = [
  { id: "dashboard", href: "/admin", icon: "dashboard" },
  { id: "experiences", href: "/admin/experiences", icon: "experiences" },
  { id: "vendors", href: "/admin/vendors", icon: "vendors" },
  { id: "bookings", href: "/admin/bookings", icon: "bookings", badge: 12 },
  { id: "payouts", href: "/admin/payouts", icon: "payouts", badge: 3 },
  { id: "reviews", href: "/admin/reviews", icon: "reviews", badge: 2 },
  { id: "reports", href: "/admin/reports", icon: "reports" },
  { id: "support", href: "/admin/support", icon: "support", badge: 5 },
];
