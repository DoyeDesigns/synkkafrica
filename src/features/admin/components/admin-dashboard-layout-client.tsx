"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { AdminDashboardSideNavBar } from "@/components/layout/admin-dashboard-side-nav-bar";
import { AdminDashboardHeader } from "@/features/admin/components/admin-dashboard-header";
import { AdminToastProvider } from "@/features/admin/components/admin-ui";
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

  // While the mobile drawer is open: Escape closes it and the page behind it
  // stops scrolling.
  useEffect(() => {
    if (!isMobileOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMobileOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileOpen]);

  // The login and invite-accept pages render without the dashboard chrome.
  if (pathname === "/admin/login" || pathname === "/admin/accept-invite") {
    return <>{children}</>;
  }

  return (
    <AdminToastProvider>
      <div className="flex h-screen overflow-hidden">
        <a
          href="#admin-main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-[#135391] focus:shadow-lg"
        >
          Skip to content
        </a>

        <div
          aria-hidden="true"
          onClick={() => setIsMobileOpen(false)}
          className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 lg:hidden ${
            isMobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        />

        <AdminDashboardSideNavBar
          isMobileOpen={isMobileOpen}
          onNavigate={() => setIsMobileOpen(false)}
          onClose={() => setIsMobileOpen(false)}
          closeLabel={t("vendor.nav.closeMenu")}
        />

        <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
          <AdminDashboardHeader
            adminName={adminName}
            adminEmail={adminEmail}
            isMobileOpen={isMobileOpen}
            onMenuToggle={() => setIsMobileOpen((open) => !open)}
          />
          <main
            id="admin-main"
            tabIndex={-1}
            className="min-h-0 flex-1 overflow-y-auto bg-[#FBFBFB] focus:outline-none"
          >
            <div className="space-y-8 p-4 sm:p-6 lg:p-8">{children}</div>
          </main>
        </div>
      </div>
    </AdminToastProvider>
  );
}
