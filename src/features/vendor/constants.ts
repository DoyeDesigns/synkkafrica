export const VENDOR_AREA_PREFIX = "/vendor";

export type VendorNavItem = {
  id: string;
  href: string;
  icon:
    | "dashboard"
    | "listings"
    | "bookings"
    | "earnings"
    | "businessProfile"
    | "settings"
    | "support";
  badge?: number;
};

export const VENDOR_WORKSPACE_NAV: VendorNavItem[] = [
  { id: "dashboard", href: "/vendor", icon: "dashboard" },
  { id: "listings", href: "/vendor/listings", icon: "listings" },
  { id: "bookings", href: "/vendor/bookings", icon: "bookings", badge: 9 },
  { id: "earnings", href: "/vendor/earnings", icon: "earnings" },
];

export const VENDOR_ACCOUNT_NAV: VendorNavItem[] = [
  { id: "businessProfile", href: "/vendor/business-profile", icon: "businessProfile" },
  { id: "settings", href: "/vendor/settings", icon: "settings" },
  { id: "support", href: "/vendor/support", icon: "support" },
];
