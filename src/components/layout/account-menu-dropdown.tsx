"use client";

import {
  BookMarked,
  Heart,
  MessageSquareHeart,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import type { Session } from "next-auth";

import { NavbarDropdownPanel } from "@/components/layout/navbar-dropdown-panel";
import { NavbarSignOutItem } from "@/components/layout/navbar-sign-out-item";
import { useClickOutside } from "@/hooks/use-click-outside";
import { useTranslation } from "@/hooks/use-translation";

const ACCOUNT_NOTIFICATION_BADGE = 2;

type AccountMenuDropdownProps = {
  session: Session;
};

const menuItems = [
  { href: "/account", labelKey: "nav.myAccount" as const, icon: "user", badge: ACCOUNT_NOTIFICATION_BADGE },
  { href: "/account/bookings", labelKey: "nav.bookingsTrips" as const, icon: "bookings" },
  { href: "/account/saved", labelKey: "nav.saved" as const, icon: "heart" },
  { href: "/account/reviews", labelKey: "nav.reviews" as const, icon: "reviews" },
] as const;

function MenuIcon({ icon }: { icon: (typeof menuItems)[number]["icon"] }) {
  const className = "h-5 w-5 shrink-0 text-[#3C3C3C]";

  switch (icon) {
    case "user":
      return <User className={className} strokeWidth={1.75} />;
    case "bookings":
      return <BookMarked className={className} strokeWidth={1.75} />;
    case "heart":
      return <Heart className={className} strokeWidth={1.75} />;
    case "reviews":
      return <MessageSquareHeart className={className} strokeWidth={1.75} />;
  }
}

export function AccountMenuDropdown({ session }: AccountMenuDropdownProps) {
  const t = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setOpen(false), open);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Account menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/80 text-white transition-opacity hover:opacity-80"
      >
        {session.user?.image ? (
          <img
            src={session.user.image}
            alt=""
            className="h-full w-full rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <User className="h-6 w-6" strokeWidth={1.5} />
        )}
        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-semibold leading-none text-white">
          {ACCOUNT_NOTIFICATION_BADGE}
        </span>
      </button>

      {open ? (
        <NavbarDropdownPanel className="min-w-[260px] py-3">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => (
              <li key={item.labelKey}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium font-satoshi text-foreground transition-colors hover:bg-zinc-50"
                >
                  <MenuIcon icon={item.icon} />
                  <span className="flex-1">{t(item.labelKey)}</span>
                  {"badge" in item && item.badge ? (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#E53935] px-1.5 text-[11px] font-bold text-white">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mx-3 my-2 border-t border-[#E8E8E8]" />

          <NavbarSignOutItem label={t("nav.signOut")} />
        </NavbarDropdownPanel>
      ) : null}
    </div>
  );
}
