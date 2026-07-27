export const VENDOR_AREA_PREFIX = "/vendor";

export type VendorVerificationStatus = "verified" | "unverified" | "pending";

export const DEFAULT_VENDOR_VERIFICATION_STATUS: VendorVerificationStatus =
  "verified";

export const VENDOR_VERIFICATION_NOTICE_EXCLUDED_PATHS = [
  "/vendor/notifications",
  "/vendor/support",
] as const;

export function shouldShowVendorVerificationNotice(
  pathname: string,
  status: VendorVerificationStatus,
) {
  if (status === "verified") {
    return false;
  }

  return !VENDOR_VERIFICATION_NOTICE_EXCLUDED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export type VendorNavItem = {
  id: string;
  href: string;
  icon:
    | "dashboard"
    | "listings"
    | "bookings"
    | "earnings"
    | "notifications"
    | "businessProfile"
    | "support";
  badge?: number;
};

export const VENDOR_WORKSPACE_NAV: VendorNavItem[] = [
  { id: "dashboard", href: "/vendor", icon: "dashboard" },
  { id: "listings", href: "/vendor/listings", icon: "listings" },
  { id: "bookings", href: "/vendor/bookings", icon: "bookings", badge: 9 },
  { id: "earnings", href: "/vendor/earnings", icon: "earnings" },
  { id: "notifications", href: "/vendor/notifications", icon: "notifications", badge: 4 },
];

export const VENDOR_ACCOUNT_NAV: VendorNavItem[] = [
  { id: "businessProfile", href: "/vendor/business-profile", icon: "businessProfile" },
  { id: "support", href: "/vendor/support", icon: "support" },
];
