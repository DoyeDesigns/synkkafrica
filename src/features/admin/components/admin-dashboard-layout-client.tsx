"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

import { AdminDashboardSideNavBar } from "@/components/layout/admin-dashboard-side-nav-bar";
import { AdminDashboardHeader } from "@/features/admin/components/admin-dashboard-header";
import { useTranslation } from "@/hooks/use-translation";

type AdminDashboardLayoutClientProps = {
  children: React.ReactNode;
  adminName?: string | null;
  adminEmail?: string | null;
};

export function AdminDashboardLayoutClient({
  children,
  adminName,
  adminEmail,
}: AdminDashboardLayoutClientProps) {
  const pathname = usePathname();
  const t = useTranslation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close the mobile menu on route change — reset during render (not an
  // effect) to avoid a cascading-render pass.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setIsMobileOpen(false);
  }

  // The login and invite-accept pages render without the dashboard chrome.
  if (pathname === "/admin/login" || pathname === "/admin/accept-invite") {
    return <>{children}</>;
  }

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

      <AdminDashboardSideNavBar
        isMobileOpen={isMobileOpen}
        onNavigate={() => setIsMobileOpen(false)}
      />

      <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        <AdminDashboardHeader
          adminName={adminName}
          adminEmail={adminEmail}
          isMobileOpen={isMobileOpen}
          onMenuToggle={() => setIsMobileOpen((open) => !open)}
        />
        <main className="min-h-0 flex-1 overflow-y-auto bg-[#FBFBFB]">
          <div className="space-y-8 p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
