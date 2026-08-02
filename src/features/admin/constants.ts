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
    | "support"
    | "team"
    | "audit";
};

// Super-admin-only nav items, appended in the sidebar when the signed-in admin
// is a super admin.
export const ADMIN_SUPER_NAV_ITEMS: AdminNavItem[] = [
  { id: "team", href: "/admin/team", icon: "team" },
  { id: "audit", href: "/admin/audit", icon: "audit" },
];

export const ADMIN_NAV: AdminNavItem[] = [
  { id: "dashboard", href: "/admin", icon: "dashboard" },
  { id: "experiences", href: "/admin/experiences", icon: "experiences" },
  { id: "cars", href: "/admin/cars", icon: "cars" },
  { id: "accommodations", href: "/admin/accommodations", icon: "accommodations" },
  { id: "vendors", href: "/admin/vendors", icon: "vendors" },
  { id: "bookings", href: "/admin/bookings", icon: "bookings" },
  { id: "payouts", href: "/admin/payouts", icon: "payouts" },
  { id: "reviews", href: "/admin/reviews", icon: "reviews" },
  { id: "users", href: "/admin/users", icon: "users" },
  { id: "verifications", href: "/admin/verifications", icon: "verifications" },
  { id: "support", href: "/admin/support", icon: "support" },
];
