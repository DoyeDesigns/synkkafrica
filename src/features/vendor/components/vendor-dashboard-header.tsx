"use client";

import { Suspense } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

import type { VendorVerificationStatus } from "@/features/vendor/constants";
import { VendorVerificationBadge } from "@/features/vendor/components/vendor-verification-badge";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

const PAGE_TITLE_KEYS: Record<string, TranslationKey> = {
  "/vendor": "vendor.nav.dashboard",
  "/vendor/listings": "vendor.nav.listings",
  "/vendor/bookings": "vendor.nav.bookings",
  "/vendor/earnings": "vendor.nav.earnings",
  "/vendor/notifications": "vendor.nav.notifications",
  "/vendor/business-profile": "vendor.nav.businessProfile",
  "/vendor/support": "vendor.nav.support",
};

function getPageTitleKey(pathname: string): TranslationKey {
  return PAGE_TITLE_KEYS[pathname] ?? "vendor.nav.dashboard";
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "V";
  }

  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }

  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

type VendorDashboardHeaderProps = {
  vendorName?: string | null;
  verificationStatus?: VendorVerificationStatus;
  isMobileOpen?: boolean;
  onMenuToggle?: () => void;
};

function VendorDashboardHeaderContent({
  vendorName = "Alex Autos",
  verificationStatus = "verified",
  isMobileOpen = false,
  onMenuToggle,
}: VendorDashboardHeaderProps) {
  const pathname = usePathname();
  const t = useTranslation();
  const displayName = vendorName?.trim() || "Alex Autos";
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
          <p className="font-black font-satoshi text-[#135391]">
            {displayName}
          </p>
          <VendorVerificationBadge status={verificationStatus} />
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

function VendorDashboardHeaderFallback({
  vendorName = "Alex Autos",
  verificationStatus = "verified",
}: VendorDashboardHeaderProps) {
  const t = useTranslation();
  const displayName = vendorName?.trim() || "Alex Autos";
  const initials = getInitials(displayName);

  return (
    <header className="flex shrink-0 items-center justify-between border-b border-[#E5E5E5] bg-white px-4 py-4 lg:px-8 lg:py-5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="size-10 shrink-0 lg:hidden" aria-hidden="true" />
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <span className="hidden font-bold font-satoshi text-[#D85A30] sm:inline">
            SynkkAfrica
          </span>
          <span className="hidden text-[#CCCCCC] sm:inline" aria-hidden="true">
            |
          </span>
          <span className="truncate text-base font-medium font-satoshi text-[#2A2A2A]">
            {t("vendor.nav.dashboard")}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <div className="hidden text-right sm:block">
          <p className="font-black font-satoshi text-[#135391]">
            {displayName}
          </p>
          <VendorVerificationBadge status={verificationStatus} />
        </div>
        <div
          className="flex size-9.5 shrink-0 items-center justify-center rounded-full bg-[#004785] font-bold font-satoshi text-white"
          aria-hidden="true"
        >
          {initials}
        </div>
      </div>
    </header>
  );
}

export function VendorDashboardHeader(props: VendorDashboardHeaderProps) {
  return (
    <Suspense fallback={<VendorDashboardHeaderFallback {...props} />}>
      <VendorDashboardHeaderContent {...props} />
    </Suspense>
  );
}
