"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { VendorDashboardSideNavBar } from "@/components/layout/vendor-dashboard-side-nav-bar";
import { VendorDashboardHeader } from "@/features/vendor/components/vendor-dashboard-header";
import { VendorVerificationNotice } from "@/features/vendor/components/vendor-verification-notice";
import {
  shouldShowVendorVerificationNotice,
  type VendorVerificationStatus,
} from "@/features/vendor/constants";
import { useTranslation } from "@/hooks/use-translation";

type VendorDashboardLayoutClientProps = {
  children: React.ReactNode;
  vendorName?: string | null;
  verificationStatus?: VendorVerificationStatus;
};

export function VendorDashboardLayoutClient({
  children,
  vendorName,
  verificationStatus,
}: VendorDashboardLayoutClientProps) {
  const pathname = usePathname();
  const t = useTranslation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const showVerificationNotice = shouldShowVendorVerificationNotice(
    pathname,
    verificationStatus ?? "verified",
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {isMobileOpen ? (
        <button
          type="button"
          aria-label={t("vendor.nav.closeMenu")}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      ) : null}

      <VendorDashboardSideNavBar
        isMobileOpen={isMobileOpen}
        onNavigate={() => setIsMobileOpen(false)}
      />

      <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        <VendorDashboardHeader
          vendorName={vendorName}
          verificationStatus={verificationStatus}
          isMobileOpen={isMobileOpen}
          onMenuToggle={() => setIsMobileOpen((open) => !open)}
        />
        <main className="min-h-0 flex-1 overflow-y-auto bg-[#FBFBFB]">
          <div className="space-y-8 p-4 sm:p-6 lg:p-8">
            {showVerificationNotice &&
            (verificationStatus === "unverified" ||
              verificationStatus === "pending") ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <VendorVerificationNotice status={verificationStatus} />
                </div>
                {children}
              </div>
            ) : (
              children
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
