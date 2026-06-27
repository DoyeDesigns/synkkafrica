export const ACCOUNT_AREA_PREFIX = "/account";

export type AccountNavItem = {
  id: string;
  label: string;
  href: string;
  icon:
    | "user"
    | "bell"
    | "bookings"
    | "heart"
    | "reviews";
  badge?: number;
};

export const ACCOUNT_NAV_ITEMS: AccountNavItem[] = [
  {
    id: "account",
    label: "My Account",
    href: "/account",
    icon: "user",
  },
  {
    id: "notifications",
    label: "Notifications",
    href: "/account/notifications",
    icon: "bell",
    badge: 2,
  },
  {
    id: "bookings",
    label: "Bookings & Trips",
    href: "/account/bookings",
    icon: "bookings",
  },
  {
    id: "saved",
    label: "Saved",
    href: "/account/saved",
    icon: "heart",
  },
  {
    id: "reviews",
    label: "Reviews",
    href: "/account/reviews",
    icon: "reviews",
  },
];
