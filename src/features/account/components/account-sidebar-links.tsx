"use client";

import {
  Bell,
  BookMarked,
  BookOpen,
  Heart,
  MessageSquare,
  MessageSquareHeart,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ACCOUNT_NAV_ITEMS } from "@/features/account/constants";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

const NAV_LABEL_KEYS: Record<(typeof ACCOUNT_NAV_ITEMS)[number]["id"], TranslationKey> = {
  account: "nav.myAccount",
  notifications: "account.nav.notifications",
  bookings: "nav.bookingsTrips",
  saved: "nav.saved",
  reviews: "nav.reviews",
};

function NavIcon({ icon }: { icon: (typeof ACCOUNT_NAV_ITEMS)[number]["icon"] }) {
  const className = "h-5 w-5 shrink-0";

  switch (icon) {
    case "user":
      return <User className={className} fill="#D85A30" stroke="#D85A30" strokeWidth={1.75} />;
    case "bell":
      return <Bell className={className} strokeWidth={1.75} />;
    case "bookings":
      return <BookMarked className={className} strokeWidth={1.75} />;
    case "heart":
      return <Heart className={className} strokeWidth={1.75} />;
    case "reviews":
      return <MessageSquareHeart className={className} strokeWidth={1.75} />;
  }
}

export function AccountSidebarLinks() {
  const pathname = usePathname();
  const t = useTranslation();

  return (
    <>
      {ACCOUNT_NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/account"
            ? pathname === "/account"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.id}
            href={item.href}
            className={`flex items-center gap-3 rounded-[10px] border h-16 px-4 py-3.5 text-sm font-medium font-satoshi transition-colors ${
              isActive
                ? "border-[#D85A30] bg-[#D85A30]/8 text-[#D85A30]"
                : "border-[#E9E9E9] bg-white text-foreground hover:bg-zinc-50"
            }`}
          >
            <NavIcon icon={item.icon} />
            <span className="flex-1">{t(NAV_LABEL_KEYS[item.id])}</span>
            {item.badge ? (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#E53935] px-1.5 text-[11px] font-bold text-white">
                {item.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </>
  );
}
