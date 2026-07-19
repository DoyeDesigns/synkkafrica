"use client";

import { Suspense } from "react";
import {
  Building2,
  Calendar,
  CircleHelp,
  LayoutGrid,
  List,
  LogOut,
  Settings,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  VENDOR_ACCOUNT_NAV,
  VENDOR_WORKSPACE_NAV,
  type VendorNavItem,
} from "@/features/vendor/constants";
import { useTranslation } from "@/hooks/use-translation";
import { signOutAction } from "@/lib/auth/actions";
import type { TranslationKey } from "@/lib/preferences/translations";

const NAV_LABEL_KEYS: Record<VendorNavItem["id"], TranslationKey> = {
  dashboard: "vendor.nav.dashboard",
  listings: "vendor.nav.listings",
  bookings: "vendor.nav.bookings",
  earnings: "vendor.nav.earnings",
  businessProfile: "vendor.nav.businessProfile",
  settings: "vendor.nav.settings",
  support: "vendor.nav.support",
};

const NAV_ICONS: Record<VendorNavItem["icon"], LucideIcon> = {
  dashboard: LayoutGrid,
  listings: List,
  bookings: Calendar,
  earnings: Wallet,
  businessProfile: Building2,
  settings: Settings,
  support: CircleHelp,
};

function isNavItemActive(pathname: string, href: string) {
  if (href === "/vendor") {
    return pathname === "/vendor";
  }

  return pathname.startsWith(href);
}

type VendorNavLinkProps = {
  item: VendorNavItem;
  pathname: string;
  onNavigate?: () => void;
};

function VendorNavLink({ item, pathname, onNavigate }: VendorNavLinkProps) {
  const t = useTranslation();
  const isActive = isNavItemActive(pathname, item.href);
  const Icon = NAV_ICONS[item.icon];

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`flex h-11 items-center gap-3 rounded-[5px] px-3 py-2.5 text-sm font-medium font-satoshi transition-colors ${
        isActive
          ? "bg-[#135391] text-white fill-white"
          : "text-[#3C3C3C] hover:bg-[#F5F5F5]"
      }`}
    >
      <Icon
        className="h-[18px] w-[18px] shrink-0"
        strokeWidth={1.75}
      />
      <span className="flex-1">{t(NAV_LABEL_KEYS[item.id])}</span>
      {item.badge ? (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#E53935] px-1.5 text-[11px] font-bold text-white">
          {item.badge}
        </span>
      ) : null}
    </Link>
  );
}

type VendorNavSectionProps = {
  titleKey: TranslationKey;
  items: VendorNavItem[];
  pathname: string;
  onNavigate?: () => void;
};

function VendorNavSection({
  titleKey,
  items,
  pathname,
  onNavigate,
}: VendorNavSectionProps) {
  const t = useTranslation();

  return (
    <div>
      <p className="mb-2 px-3 text-xs font-semibold font-satoshi uppercase tracking-wide text-[#135391]">
        {t(titleKey)}
      </p>
      <div className="space-y-1">
        {items.map((item) => (
          <VendorNavLink
            key={item.id}
            item={item}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </div>
  );
}

function getSidebarClassName(isMobileOpen: boolean) {
  return [
    "fixed inset-y-0 left-0 z-50 flex h-screen w-[228px] shrink-0 flex-col border-r border-[#EEEEEE] bg-white transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:translate-x-0",
    isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
  ].join(" ");
}

type VendorDashboardSideNavBarContentProps = {
  isMobileOpen: boolean;
  onNavigate?: () => void;
};

function VendorDashboardSideNavBarContent({
  isMobileOpen,
  onNavigate,
}: VendorDashboardSideNavBarContentProps) {
  const pathname = usePathname();
  const t = useTranslation();

  return (
    <aside className={getSidebarClassName(isMobileOpen)}>
      <div className="px-6 pb-6 pt-8">
        <Link href="/vendor" className="flex items-center">
          <Image
            src="/synkkafrica-logo.svg"
            alt=""
            width={50}
            height={50}
            priority
          />
          <span className="text-lg font-bold tracking-tight font-montserrat text-[#2F2F2F]">
            SYNKAFRIKA
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-8 overflow-y-auto px-4 pb-6">
        <VendorNavSection
          titleKey="vendor.nav.workspace"
          items={VENDOR_WORKSPACE_NAV}
          pathname={pathname}
          onNavigate={onNavigate}
        />
        <VendorNavSection
          titleKey="vendor.nav.account"
          items={VENDOR_ACCOUNT_NAV}
          pathname={pathname}
          onNavigate={onNavigate}
        />
      </nav>

      <div className="border-t border-[#EEEEEE] p-4">
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg bg-[#DD2222]/15 px-4 py-3 text-sm font-bold font-satoshi text-[#DD2222] transition-opacity hover:opacity-90"
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
            {t("vendor.nav.logOut")}
          </button>
        </form>
      </div>
    </aside>
  );
}

function VendorDashboardSideNavBarFallback() {
  const t = useTranslation();

  return (
    <aside className={getSidebarClassName(false)}>
      <div className="px-6 pb-6 pt-8">
        <Link href="/vendor" className="flex items-center gap-2.5">
          <Image
            src="/synkkafrica-logo.svg"
            alt=""
            width={40}
            height={40}
            priority
          />
          <span className="text-lg font-bold tracking-tight font-montserrat text-[#2F2F2F]">
            SYNKAFRIKA
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-8 overflow-y-auto px-4 pb-6">
        <VendorNavSection
          titleKey="vendor.nav.workspace"
          items={VENDOR_WORKSPACE_NAV}
          pathname=""
        />
        <VendorNavSection
          titleKey="vendor.nav.account"
          items={VENDOR_ACCOUNT_NAV}
          pathname=""
        />
      </nav>

      <div className="border-t border-[#EEEEEE] p-4">
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg bg-[#DD2222]/15 px-4 py-3 text-sm font-bold font-satoshi text-[#DD2222] transition-opacity hover:opacity-90"
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
            {t("vendor.nav.logOut")}
          </button>
        </form>
      </div>
    </aside>
  );
}

export type VendorDashboardSideNavBarProps = {
  isMobileOpen?: boolean;
  onNavigate?: () => void;
};

export function VendorDashboardSideNavBar({
  isMobileOpen = false,
  onNavigate,
}: VendorDashboardSideNavBarProps) {
  return (
    <Suspense fallback={<VendorDashboardSideNavBarFallback />}>
      <VendorDashboardSideNavBarContent
        isMobileOpen={isMobileOpen}
        onNavigate={onNavigate}
      />
    </Suspense>
  );
}
