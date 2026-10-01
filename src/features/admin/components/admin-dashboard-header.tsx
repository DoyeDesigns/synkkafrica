"use client";

import { Suspense, useEffect, useId, useRef, useState } from "react";
import { ChevronDown, LogOut, Menu, ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";

import { useClickOutside } from "@/hooks/use-click-outside";
import { useTranslation } from "@/hooks/use-translation";
import { getAdminMe } from "@/lib/api/admin-auth";
import { signOutAdminAction } from "@/lib/auth/actions";
import type { TranslationKey } from "@/lib/preferences/translations";

// Section title per top-level admin route. Sub-routes fall back to their
// section's title unless a detail title is listed in DETAIL_TITLE_KEYS.
const PAGE_TITLE_KEYS: Record<string, TranslationKey> = {
  "/admin": "admin.nav.dashboard",
  "/admin/packages": "admin.nav.packages",
  "/admin/deals": "admin.nav.deals",
  "/admin/experiences": "admin.nav.experiences",
  "/admin/cars": "admin.nav.cars",
  "/admin/accommodations": "admin.nav.accommodations",
  "/admin/listings": "admin.listings.detailTitle",
  "/admin/vendors": "admin.nav.vendors",
  "/admin/bookings": "admin.nav.bookings",
  "/admin/payouts": "admin.nav.payouts",
  "/admin/reviews": "admin.nav.reviews",
  "/admin/users": "admin.nav.users",
  "/admin/verifications": "admin.nav.verifications",
  "/admin/support": "admin.nav.support",
  "/admin/team": "admin.nav.team",
  "/admin/audit": "admin.nav.audit",
};

// Detail pages (/admin/<section>/<id>) and their own title.
const DETAIL_TITLE_KEYS: Record<string, TranslationKey> = {
  "/admin/vendors": "admin.vendors.details",
  "/admin/users": "admin.users.details",
  "/admin/listings": "admin.listings.detailTitle",
  "/admin/cars": "admin.listings.detailTitle",
  "/admin/accommodations": "admin.listings.detailTitle",
  "/admin/experiences": "admin.listings.detailTitle",
};

type PageTitle = {
  key: TranslationKey;
  // Present on detail pages: the section to link back to.
  parent?: { href: string; key: TranslationKey };
};

function getPageTitle(pathname: string): PageTitle {
  const clean = pathname.replace(/\/+$/, "") || "/admin";
  if (PAGE_TITLE_KEYS[clean]) return { key: PAGE_TITLE_KEYS[clean] };

  const section = clean.split("/").slice(0, 3).join("/");
  const sectionKey = PAGE_TITLE_KEYS[section];
  const detailKey = DETAIL_TITLE_KEYS[section];
  if (detailKey) {
    return {
      key: detailKey,
      parent:
        sectionKey && sectionKey !== detailKey
          ? { href: section, key: sectionKey }
          : undefined,
    };
  }
  if (sectionKey) return { key: sectionKey };
  return { key: "admin.nav.dashboard" };
}

function getInitials(name: string) {
  const local = name.includes("@") ? name.split("@")[0]! : name;
  const parts = local
    .trim()
    .split(/[\s._-]+/)
    .filter(Boolean);

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
  adminEmail?: string | null;
  isMobileOpen?: boolean;
  onMenuToggle?: () => void;
};

function AdminAccountMenu({
  displayName,
  adminEmail,
  initials,
}: {
  displayName: string;
  adminEmail?: string | null;
  initials: string;
}) {
  const t = useTranslation();
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { data: session } = useSession();
  const token = session?.accessToken;

  const { data: me } = useQuery({
    queryKey: ["admin-me"],
    queryFn: () => getAdminMe(token as string),
    enabled: Boolean(token),
    refetchOnWindowFocus: false,
  });

  useClickOutside(containerRef, () => setOpen(false), open);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const email = me?.email ?? adminEmail ?? null;
  const roleLabel = me?.isSuperAdmin ? "Super admin" : t("admin.header.role");

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`Account menu for ${displayName}`}
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-[#F5F5F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#135391] sm:gap-3 sm:rounded-xl sm:pl-3"
      >
        <span className="hidden text-right sm:block">
          <span className="block max-w-[220px] truncate font-black font-satoshi text-[#135391]">
            {displayName}
          </span>
          <span className="block text-sm font-medium font-satoshi text-[#676565]">
            {roleLabel}
          </span>
        </span>
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#135391] text-sm font-semibold font-satoshi text-white"
          aria-hidden="true"
        >
          {initials}
        </span>
        <ChevronDown
          className={`hidden h-4 w-4 text-[#676565] transition-transform sm:block ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Account"
          className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-[#EEEEEE] bg-white shadow-lg"
        >
          <div className="flex items-center gap-3 border-b border-[#F2F2F2] px-4 py-4">
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#135391] text-sm font-semibold font-satoshi text-white"
              aria-hidden="true"
            >
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold font-satoshi text-[#2F2F2F]">
                {displayName}
              </p>
              {email && email !== displayName ? (
                <p className="truncate text-xs font-medium font-satoshi text-[#676565]">
                  {email}
                </p>
              ) : null}
              <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#F0F6FC] px-2 py-0.5 text-[11px] font-semibold font-satoshi text-[#135391]">
                <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                {roleLabel}
                {me ? (me.mfaEnrolled ? " · MFA on" : " · MFA pending") : ""}
              </p>
            </div>
          </div>
          {me?.isSuperAdmin ? (
            <div className="border-b border-[#F2F2F2] py-1">
              <Link
                href="/admin/team"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm font-medium font-satoshi text-[#2F2F2F] hover:bg-[#F7F9FC] focus-visible:bg-[#F7F9FC] focus-visible:outline-none"
              >
                {t("admin.nav.team")}
              </Link>
              <Link
                href="/admin/audit"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm font-medium font-satoshi text-[#2F2F2F] hover:bg-[#F7F9FC] focus-visible:bg-[#F7F9FC] focus-visible:outline-none"
              >
                {t("admin.nav.audit")}
              </Link>
            </div>
          ) : null}
          <form
            action={signOutAdminAction}
            onSubmit={() => setSigningOut(true)}
            className="py-1"
          >
            <button
              type="submit"
              role="menuitem"
              disabled={signingOut}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-bold font-satoshi text-[#DD2222] hover:bg-[#FDF2F2] focus-visible:bg-[#FDF2F2] focus-visible:outline-none disabled:opacity-60"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              {signingOut ? "Signing out…" : t("vendor.nav.logOut")}
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function AdminDashboardHeaderContent({
  adminName,
  adminEmail,
  isMobileOpen = false,
  onMenuToggle,
}: AdminDashboardHeaderProps) {
  const pathname = usePathname();
  const t = useTranslation();
  // Prefer a real name, fall back to the email, then a generic label.
  const displayName =
    adminName?.trim() || adminEmail?.trim() || "SynkAfrica Admin";
  const initials = getInitials(displayName);
  const title = getPageTitle(pathname);
  const titleText = t(title.key);

  // Keep the browser tab in step with the page.
  useEffect(() => {
    document.title = `${titleText} · SynkAfrica Admin`;
  }, [titleText]);

  return (
    <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#E5E5E5] bg-white px-4 py-3 lg:px-8 lg:py-4">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          className="flex size-10 shrink-0 items-center justify-center rounded-lg text-[#2A2A2A] transition-colors hover:bg-[#F5F5F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#135391] lg:hidden"
          aria-label={
            isMobileOpen ? t("vendor.nav.closeMenu") : t("vendor.nav.openMenu")
          }
          aria-expanded={isMobileOpen}
          aria-controls="admin-sidebar"
        >
          {isMobileOpen ? (
            <X className="h-5 w-5" strokeWidth={2} />
          ) : (
            <Menu className="h-5 w-5" strokeWidth={2} />
          )}
        </button>

        <nav
          aria-label="Breadcrumb"
          className="flex min-w-0 items-center gap-2 sm:gap-3"
        >
          <span className="hidden font-bold font-satoshi text-[#D85A30] sm:inline">
            SynkAfrica
          </span>
          <span className="hidden text-[#CCCCCC] sm:inline" aria-hidden="true">
            |
          </span>
          {title.parent ? (
            <>
              <Link
                href={title.parent.href}
                className="hidden shrink-0 rounded text-base font-medium font-satoshi text-[#676565] hover:text-[#135391] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#135391] sm:inline"
              >
                {t(title.parent.key)}
              </Link>
              <span
                className="hidden text-[#CCCCCC] sm:inline"
                aria-hidden="true"
              >
                /
              </span>
            </>
          ) : null}
          <span
            aria-current="page"
            className="truncate text-base font-semibold font-satoshi text-[#2A2A2A]"
          >
            {titleText}
          </span>
        </nav>
      </div>

      <AdminAccountMenu
        displayName={displayName}
        adminEmail={adminEmail}
        initials={initials}
      />
    </header>
  );
}

function AdminDashboardHeaderFallback({
  adminName = "SynkAfrica Admin",
}: AdminDashboardHeaderProps) {
  const t = useTranslation();
  const displayName = adminName?.trim() || "SynkAfrica Admin";
  const initials = getInitials(displayName);

  return (
    <header className="flex shrink-0 items-center justify-between border-b border-[#E5E5E5] bg-white px-4 py-3 lg:px-8 lg:py-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="size-10 shrink-0 lg:hidden" aria-hidden="true" />
        <span className="truncate text-base font-medium font-satoshi text-[#2A2A2A]">
          {t("admin.nav.dashboard")}
        </span>
      </div>
      <div
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#135391] text-sm font-semibold font-satoshi text-white"
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
