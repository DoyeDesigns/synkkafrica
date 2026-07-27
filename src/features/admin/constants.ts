export const ADMIN_AREA_PREFIX = "/admin";

export type AdminNavItem = {
  id: string;
  href: string;
  icon:
    | "dashboard"
    | "experiences"
    | "cars"
    | "accommodations"
    | "vendors"
    | "bookings"
    | "payouts"
    | "reviews"
    | "users"
    | "verifications"
    | "support";
  badge?: number;
};

export const ADMIN_NAV: AdminNavItem[] = [
  { id: "dashboard", href: "/admin", icon: "dashboard" },
  { id: "experiences", href: "/admin/experiences", icon: "experiences" },
  { id: "cars", href: "/admin/cars", icon: "cars" },
  { id: "accommodations", href: "/admin/accommodations", icon: "accommodations" },
  { id: "vendors", href: "/admin/vendors", icon: "vendors" },
  { id: "bookings", href: "/admin/bookings", icon: "bookings", badge: 12 },
  { id: "payouts", href: "/admin/payouts", icon: "payouts", badge: 3 },
  { id: "reviews", href: "/admin/reviews", icon: "reviews", badge: 2 },
  { id: "users", href: "/admin/users", icon: "users" },
  {
    id: "verifications",
    href: "/admin/verifications",
    icon: "verifications",
    badge: 3,
  },
  { id: "support", href: "/admin/support", icon: "support", badge: 5 },
];
