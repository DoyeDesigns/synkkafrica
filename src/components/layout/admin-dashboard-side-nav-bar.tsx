"use client";

import { Fragment, Suspense } from "react";
import {
  Building2,
  Calendar,
  Car,
  Check,
  CircleHelp,
  Home,
  LayoutGrid,
  BadgePercent,
  Package,
  LogOut,
  ScrollText,
  X,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";

import {
  ADMIN_NAV,
  ADMIN_SUPER_NAV_ITEMS,
  type AdminNavItem,
} from "@/features/admin/constants";
import { useTranslation } from "@/hooks/use-translation";
import {
  adminGetOverview,
  adminListListings,
  type AdminListing,
  type AdminOverview,
} from "@/lib/api/admin";
import {
  LIVE_QUERY_OPTIONS,
  POLLING_QUERY_OPTIONS,
} from "@/lib/live-query-options";
import { getAdminMe } from "@/lib/api/admin-auth";
import { SignOutConfirmButton } from "@/components/auth/sign-out-confirm";
import { signOutAdminAction } from "@/lib/auth/actions";
import type { TranslationKey } from "@/lib/preferences/translations";

// Maps the live overview counts onto the actionable nav items. Reviews have no
// pending queue (published/hidden only), so they carry no badge. Pending
// listings are split per category from the pending-listings queue.
function navBadges(
  overview: AdminOverview | undefined,
  pendingListings: AdminListing[] | undefined,
): Partial<Record<AdminNavItem["id"], number>> {
  const byCategory = (category: AdminListing["category"]) =>
    pendingListings?.filter((l) => l.category === category).length;
  return {
    experiences: byCategory("experiences"),
    cars: byCategory("cars"),
    accommodations: byCategory("accommodations"),
    vendors: overview?.pendingVendors,
    bookings: overview?.awaitingBookings,
    payouts: overview?.pendingPayouts,
    verifications: overview?.pendingDocuments,
    support: overview?.openSupportTickets,
  };
}

const BADGE_HINTS: Partial<Record<AdminNavItem["id"], string>> = {
  experiences: "pending review",
  cars: "pending review",
  accommodations: "pending review",
  vendors: "awaiting approval",
  bookings: "awaiting response",
  payouts: "payout requests",
  verifications: "documents to verify",
  support: "open tickets",
};

// Visual groups (separated by a divider) — catalog, operations, admin.
const NAV_GROUP_STARTS = new Set<AdminNavItem["id"]>([
  "experiences",
  "vendors",
  "team",
]);

const NAV_LABEL_KEYS: Record<AdminNavItem["id"], TranslationKey> = {
  dashboard: "admin.nav.dashboard",
  experiences: "admin.nav.experiences",
  cars: "admin.nav.cars",
  accommodations: "admin.nav.accommodations",
  packages: "admin.nav.packages",
  deals: "admin.nav.deals",
  vendors: "admin.nav.vendors",
  bookings: "admin.nav.bookings",
  payouts: "admin.nav.payouts",
  reviews: "admin.nav.reviews",
  users: "admin.nav.users",
  verifications: "admin.nav.verifications",
  support: "admin.nav.support",
  team: "admin.nav.team",
  audit: "admin.nav.audit",
};

const NAV_ICONS: Record<AdminNavItem["icon"], LucideIcon> = {
  dashboard: LayoutGrid,
  experiences: Sparkles,
  cars: Car,
  accommodations: Home,
  packages: Package,
  deals: BadgePercent,
  vendors: Building2,
  bookings: Calendar,
  payouts: Wallet,
  reviews: Star,
  users: Users,
  verifications: Check,
  support: CircleHelp,
  team: ShieldCheck,
  audit: ScrollText,
};

function isNavItemActive(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

type AdminNavLinkProps = {
  item: AdminNavItem;
  pathname: string;
  badge?: number;
  onNavigate?: () => void;
};

function AdminNavLink({
  item,
  pathname,
  badge,
  onNavigate,
}: AdminNavLinkProps) {
  const t = useTranslation();
  const isActive = isNavItemActive(pathname, item.href);
  const Icon = NAV_ICONS[item.icon];

  const hint = BADGE_HINTS[item.id];

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={`group relative flex h-11 items-center gap-3 rounded-[6px] px-3 py-2.5 text-sm font-satoshi transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#135391] focus-visible:ring-offset-2 ${
        isActive
          ? "bg-[#135391] font-bold text-white shadow-sm"
          : "font-medium text-[#3C3C3C] hover:bg-[#F0F6FC] hover:text-[#135391]"
      }`}
    >
      {isActive ? (
        <span
          aria-hidden="true"
          className="absolute -left-4 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[#D85A30]"
        />
      ) : null}
      <Icon
        className="h-[18px] w-[18px] shrink-0"
        strokeWidth={isActive ? 2.25 : 1.75}
      />
      <span className="flex-1 truncate">{t(NAV_LABEL_KEYS[item.id])}</span>
      {badge ? (
        <span
          className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold ${
            isActive ? "bg-white text-[#135391]" : "bg-[#E53935] text-white"
          }`}
          title={hint ? `${badge} ${hint}` : undefined}
        >
          <span aria-hidden="true">{badge > 99 ? "99+" : badge}</span>
          <span className="sr-only">
            {hint ? `, ${badge} ${hint}` : `, ${badge}`}
          </span>
        </span>
      ) : null}
    </Link>
  );
}

function getSidebarClassName(isMobileOpen: boolean) {
  return [
    "fixed inset-y-0 left-0 z-50 flex h-screen w-[228px] shrink-0 flex-col border-r border-[#EEEEEE] bg-white transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:translate-x-0",
    isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
  ].join(" ");
}

type AdminDashboardSideNavBarProps = {
  isMobileOpen?: boolean;
  onNavigate?: () => void;
  onClose?: () => void;
  closeLabel?: string;
};

function AdminDashboardSideNavBarContent({
  isMobileOpen,
  onNavigate,
  onClose,
  closeLabel,
}: AdminDashboardSideNavBarProps) {
  const pathname = usePathname();
  const t = useTranslation();
  const { data: session } = useSession();
  const token = session?.accessToken;

  const { data: overview } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => adminGetOverview(token as string),
    enabled: Boolean(token),
    ...POLLING_QUERY_OPTIONS,
  });
  const { data: pendingListings } = useQuery({
    queryKey: ["admin-listings", "pending"],
    queryFn: () => adminListListings(token as string, "pending"),
    enabled: Boolean(token),
    ...LIVE_QUERY_OPTIONS,
  });
  const badges = navBadges(overview, pendingListings);

  const { data: me } = useQuery({
    queryKey: ["admin-me"],
    queryFn: () => getAdminMe(token as string),
    enabled: Boolean(token),
    refetchOnWindowFocus: false,
  });
  const navItems = me?.isSuperAdmin
    ? [...ADMIN_NAV, ...ADMIN_SUPER_NAV_ITEMS]
    : ADMIN_NAV;

  return (
    <aside
      id="admin-sidebar"
      aria-label="Admin navigation"
      className={getSidebarClassName(isMobileOpen ?? false)}
    >
      <div className="flex items-center justify-between px-6 pb-6 pt-8">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#135391]"
        >
          <Image
            src="/synkafrica-logo.svg"
            alt=""
            width={50}
            height={50}
            priority
          />
          <span className="text-lg font-bold tracking-tight font-montserrat text-[#2F2F2F]">
            SynkAfrica
          </span>
        </Link>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel ?? "Close menu"}
            className="flex size-9 items-center justify-center rounded-lg text-[#676565] hover:bg-[#F5F5F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#135391] lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      <nav className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="space-y-1">
          {navItems.map((item, index) => (
            <Fragment key={item.id}>
              {index > 0 && NAV_GROUP_STARTS.has(item.id) ? (
                <div
                  aria-hidden="true"
                  className="my-3 border-t border-[#F0F0F0]"
                />
              ) : null}
              <AdminNavLink
                item={item}
                pathname={pathname}
                badge={badges[item.id]}
                onNavigate={onNavigate}
              />
            </Fragment>
          ))}
        </div>
      </nav>

      <div className="border-t border-[#EEEEEE] p-4">
        <SignOutConfirmButton
          action={signOutAdminAction}
          className="flex w-full items-center gap-3 rounded-lg bg-[#DD2222]/10 px-4 py-3 text-sm font-bold font-satoshi text-[#DD2222] transition-colors hover:bg-[#DD2222]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DD2222]"
        >
            <LogOut className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
            {t("vendor.nav.logOut")}
          </SignOutConfirmButton>
      </div>
    </aside>
  );
}

function AdminDashboardSideNavBarFallback() {
  const t = useTranslation();

  return (
    <aside className={getSidebarClassName(false)}>
      <div className="px-6 pb-6 pt-8">
        <Link href="/admin" className="flex items-center gap-2.5">
          <Image
            src="/synkafrica-logo.svg"
            alt=""
            width={40}
            height={40}
            priority
          />
          <span className="text-lg font-bold tracking-tight font-montserrat text-[#2F2F2F]">
            SynkAfrica
          </span>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="space-y-1">
          {ADMIN_NAV.map((item) => (
            <AdminNavLink key={item.id} item={item} pathname="" />
          ))}
        </div>
      </nav>
      <div className="border-t border-[#EEEEEE] p-4">
        <SignOutConfirmButton
          action={signOutAdminAction}
          className="flex w-full items-center gap-3 rounded-lg bg-[#DD2222]/15 px-4 py-3 text-sm font-bold font-satoshi text-[#DD2222]"
        >
            <LogOut className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
            {t("vendor.nav.logOut")}
          </SignOutConfirmButton>
      </div>
    </aside>
  );
}

export function AdminDashboardSideNavBar(props: AdminDashboardSideNavBarProps) {
  return (
    <Suspense fallback={<AdminDashboardSideNavBarFallback />}>
      <AdminDashboardSideNavBarContent {...props} />
    </Suspense>
  );
}
