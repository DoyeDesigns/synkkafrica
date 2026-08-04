"use client";

import { Suspense } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

const PAGE_TITLE_KEYS: Record<string, TranslationKey> = {
  "/admin": "admin.nav.dashboard",
  "/admin/packages/new": "admin.packages.createTitle",
  "/admin/experiences": "admin.nav.experiences",
  "/admin/cars": "admin.nav.cars",
  "/admin/accommodations": "admin.nav.accommodations",
  "/admin/vendors": "admin.nav.vendors",
  "/admin/bookings": "admin.nav.bookings",
  "/admin/payouts": "admin.nav.payouts",
  "/admin/reviews": "admin.nav.reviews",
  "/admin/users": "admin.nav.users",
  "/admin/verifications": "admin.nav.verifications",
  "/admin/support": "admin.nav.support",
};

function getPageTitleKey(pathname: string): TranslationKey {
  if (pathname.startsWith("/admin/vendors/") && pathname !== "/admin/vendors") {
    return "admin.vendors.details";
  }

  if (pathname.startsWith("/admin/users/") && pathname !== "/admin/users") {
    return "admin.users.details";
  }

  if (
    pathname.startsWith("/admin/cars/") &&
    pathname !== "/admin/cars"
  ) {
    return "admin.listings.detailTitle";
  }

  if (
    pathname.startsWith("/admin/accommodations/") &&
    pathname !== "/admin/accommodations"
  ) {
    return "admin.listings.detailTitle";
  }

  if (
    pathname.startsWith("/admin/experiences/") &&
    pathname !== "/admin/experiences"
  ) {
    return "admin.listings.detailTitle";
  }

  return PAGE_TITLE_KEYS[pathname] ?? "admin.nav.dashboard";
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "A";
  }

  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }

  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

type AdminDashboardHeaderProps = {
  adminName?: string | null;
  isMobileOpen?: boolean;
  onMenuToggle?: () => void;
};

function AdminDashboardHeaderContent({
  adminName = "SynKKafrica Admin",
  isMobileOpen = false,
  onMenuToggle,
}: AdminDashboardHeaderProps) {
  const pathname = usePathname();
  const t = useTranslation();
  const displayName = adminName?.trim() || "SynKKafrica Admin";
  const initials = getInitials(displayName);

  return (
    <header className="flex shrink-0 items-center justify-between border-b border-[#E5E5E5] bg-white px-4 py-4 lg:px-8 lg:py-5">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          className="flex size-10 shrink-0 items-center justify-center rounded-lg text-[#2A2A2A] transition-colors hover:bg-[#F5F5F5] lg:hidden"
          aria-label={
            isMobileOpen ? t("vendor.nav.closeMenu") : t("vendor.nav.openMenu")
          }
          aria-expanded={isMobileOpen}
        >
          {isMobileOpen ? (
            <X className="h-5 w-5" strokeWidth={2} />
          ) : (
            <Menu className="h-5 w-5" strokeWidth={2} />
          )}
        </button>

        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <span className="hidden font-bold font-satoshi text-[#D85A30] sm:inline">
            SynkkAfrica
          </span>
          <span className="hidden text-[#CCCCCC] sm:inline" aria-hidden="true">
            |
          </span>
          <span className="truncate text-base font-medium font-satoshi text-[#2A2A2A]">
            {t(getPageTitleKey(pathname))}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <div className="hidden text-right sm:block">
          <p className="font-black font-satoshi text-[#135391]">{displayName}</p>
          <p className="text-sm font-medium font-satoshi text-[#676565]">
            {t("admin.header.role")}
          </p>
        </div>
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#135391] text-sm font-semibold font-satoshi text-white"
          aria-hidden="true"
        >
          {initials}
        </div>
      </div>
    </header>
  );
}

function AdminDashboardHeaderFallback({
  adminName = "SynKKafrica Admin",
}: AdminDashboardHeaderProps) {
  const t = useTranslation();
  const displayName = adminName?.trim() || "SynKKafrica Admin";
  const initials = getInitials(displayName);

  return (
    <header className="flex shrink-0 items-center justify-between border-b border-[#E5E5E5] bg-white px-4 py-4 lg:px-8 lg:py-5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="size-10 shrink-0 lg:hidden" aria-hidden="true" />
        <span className="truncate text-base font-medium font-satoshi text-[#2A2A2A]">
          {t("admin.nav.dashboard")}
        </span>
      </div>
      <div
        className="flex size-9.5 shrink-0 items-center justify-center rounded-full bg-[#004785] font-bold font-satoshi text-white"
        aria-hidden="true"
      >
        {initials}
      </div>
    </header>
  );
}

export function AdminDashboardHeader(props: AdminDashboardHeaderProps) {
  return (
    <Suspense fallback={<AdminDashboardHeaderFallback {...props} />}>
      <AdminDashboardHeaderContent {...props} />
    </Suspense>
  );
}
