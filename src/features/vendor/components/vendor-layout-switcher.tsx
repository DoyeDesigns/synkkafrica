"use client";

import { usePathname } from "next/navigation";

import { VendorDashboardLayoutClient } from "@/features/vendor/components/vendor-dashboard-layout-client";
import type { VendorVerificationStatus } from "@/features/vendor/constants";

const STANDALONE_VENDOR_PATHS = ["/vendor/signup", "/vendor/login"];

type VendorLayoutSwitcherProps = {
  children: React.ReactNode;
  vendorName?: string | null;
  verificationStatus?: VendorVerificationStatus;
};

export function VendorLayoutSwitcher({
  children,
  vendorName,
  verificationStatus,
}: VendorLayoutSwitcherProps) {
  const pathname = usePathname();
  const isStandalone = STANDALONE_VENDOR_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (isStandalone) {
    return <>{children}</>;
  }

  return (
    <VendorDashboardLayoutClient
      vendorName={vendorName}
      verificationStatus={verificationStatus}
    >
      {children}
    </VendorDashboardLayoutClient>
  );
}
