export type AdminUserTier = "bronze" | "silver" | "gold" | "platinum";

export type AdminUserStatus = "active" | "inactive";

export type AdminUserBookingStatus = "confirmed" | "completed" | "cancelled";

export type AdminUserRecentBooking = {
  name: string;
  status: AdminUserBookingStatus;
};

export type AdminUser = {
  id: string;
  accountId: string;
  name: string;
  email: string;
  location: string;
  tier: AdminUserTier;
  bookingsCount: number;
  totalSpend: number;
  currency: string;
  lastTripDate: string;
  status: AdminUserStatus;
};

export type AdminUserDetail = AdminUser & {
  phone: string;
  whatsAppLinked: boolean;
  joinedAt: string;
  lastActiveLabel: string;
  primaryCorridor: string;
  openTickets: number;
  idVerified: boolean;
  verification: {
    governmentIdType: string;
    governmentIdVerified: boolean;
    faceMatchVerified: boolean;
    provider: string;
  };
  paymentMethods: {
    cardLabel: string;
    defaultCurrency: string;
  };
  recentBookings: AdminUserRecentBooking[];
  internalNote: {
    text: string;
    author: string;
    date: string;
  } | null;
};

export const ADMIN_USERS_PAGE_SIZE = 20;

const BASE_ADMIN_USERS: AdminUser[] = [
  {
    id: "user-noah",
    accountId: "TRV-48004",
    name: "Noah Andersson",
    email: "noah.andersson@fernmail.com",
    location: "Porto, Portugal 🇵🇹",
    tier: "silver",
    bookingsCount: 17,
    totalSpend: 8262,
    currency: "USD",
    lastTripDate: "2025-08-18",
    status: "active",
  },
  {
    id: "user-hana",
    accountId: "TRV-48010",
    name: "Hana Larsson",
    email: "hana.larsson@fernmail.com",
    location: "Mombasa, Kenya 🇰🇪",
    tier: "bronze",
    bookingsCount: 9,
    totalSpend: 2601,
    currency: "USD",
    lastTripDate: "2024-11-13",
    status: "inactive",
  },
  {
    id: "user-amara",
    accountId: "USR-08813",
    name: "Amara Chukwu",
    email: "amara@email.com",
    location: "London, UK",
    tier: "gold",
    bookingsCount: 7,
    totalSpend: 1200000,
    currency: "NGN",
    lastTripDate: "2026-06-02",
    status: "active",
  },
  {
    id: "user-kofi",
    accountId: "TRV-48031",
    name: "Kofi Mensah",
    email: "kofi@example.com",
    location: "Accra, Ghana 🇬🇭",
    tier: "silver",
    bookingsCount: 6,
    totalSpend: 4890,
    currency: "USD",
    lastTripDate: "2025-12-09",
    status: "active",
  },
];

const EXTRA_TRAVELER_NAMES = [
  "Elena Rossi",
  "James Osei",
  "Sofia Mendes",
  "David Chen",
  "Aisha Mohammed",
  "Lucas Ferreira",
  "Priya Sharma",
  "Omar Hassan",
  "Chloe Dubois",
  "Marcus Johnson",
];

const EXTRA_LOCATIONS = [
  "Lisbon, Portugal 🇵🇹",
  "Nairobi, Kenya 🇰🇪",
  "Cape Town, South Africa 🇿🇦",
  "Dubai, UAE 🇦🇪",
  "Paris, France 🇫🇷",
  "London, United Kingdom 🇬🇧",
  "Marrakesh, Morocco 🇲🇦",
  "Zanzibar, Tanzania 🇹🇿",
  "Abuja, Nigeria 🇳🇬",
  "Kigali, Rwanda 🇷🇼",
];

const TIERS: AdminUserTier[] = ["bronze", "silver", "gold", "platinum"];

function buildAdminUsers(): AdminUser[] {
  const generated = Array.from({ length: 56 }, (_, index) => {
    const template = BASE_ADMIN_USERS[index % BASE_ADMIN_USERS.length]!;
    const sequence = 48040 + index;

    return {
      ...template,
      id: `user-${sequence}`,
      accountId: `TRV-${sequence}`,
      name: EXTRA_TRAVELER_NAMES[index % EXTRA_TRAVELER_NAMES.length] ?? `Traveler ${sequence}`,
      email: `traveler${sequence}@fernmail.com`,
      location: EXTRA_LOCATIONS[index % EXTRA_LOCATIONS.length]!,
      tier: TIERS[index % TIERS.length]!,
      bookingsCount: 3 + (index % 18),
      totalSpend: 1800 + index * 415,
      currency: "USD",
      lastTripDate: `2025-${String((index % 12) + 1).padStart(2, "0")}-${String((index % 27) + 1).padStart(2, "0")}`,
      status: index % 6 === 0 ? "inactive" : "active",
    } satisfies AdminUser;
  });

  return [...BASE_ADMIN_USERS, ...generated];
}

export const ADMIN_USERS: AdminUser[] = buildAdminUsers();

export function getAdminUserById(id: string) {
  return ADMIN_USERS.find((user) => user.id === id);
}

const USER_DETAIL_OVERRIDES: Partial<Record<string, Omit<AdminUserDetail, keyof AdminUser>>> = {
  "user-amara": {
    phone: "+44 7700 900123",
    whatsAppLinked: true,
    joinedAt: "2026-02-02",
    lastActiveLabel: "3 days ago",
    primaryCorridor: "UK",
    openTickets: 0,
    idVerified: true,
    verification: {
      governmentIdType: "Passport",
      governmentIdVerified: true,
      faceMatchVerified: true,
      provider: "Didit",
    },
    paymentMethods: {
      cardLabel: "Visa •••• 4471 (GBP)",
      defaultCurrency: "GBP",
    },
    recentBookings: [
      { name: "Lekki Garden Suites", status: "confirmed" },
      { name: "Lagos Lagoon Sunset Cruise", status: "completed" },
      { name: "Alex Autos — Corolla, 3 days", status: "completed" },
    ],
    internalNote: {
      text: "Repeat customer, no issues to date. Booked 3 trips for extended family visiting from London.",
      author: "Admin",
      date: "20 Jun 2026",
    },
  },
};

const BOOKING_STATUS_POOL: AdminUserRecentBooking[] = [
  { name: "Lekki Garden Suites", status: "confirmed" },
  { name: "Lagos Lagoon Sunset Cruise", status: "completed" },
  { name: "Victoria Island Penthouse", status: "completed" },
  { name: "Toyota Camry 2023 — 5 days", status: "completed" },
  { name: "Badagry Heritage Day Trip", status: "cancelled" },
];

function buildDefaultUserDetail(user: AdminUser): AdminUserDetail {
  const index = Number.parseInt(user.id.replace(/\D/g, ""), 10) || 0;

  return {
    ...user,
    phone: `+234 80${String(10000000 + (index % 90000000)).slice(0, 8)}`,
    whatsAppLinked: index % 2 === 0,
    joinedAt: "2025-08-15",
    lastActiveLabel: index % 5 === 0 ? "2 weeks ago" : `${(index % 6) + 1} days ago`,
    primaryCorridor: user.location.includes("UK")
      ? "UK"
      : user.location.includes("Portugal")
        ? "EU"
        : user.location.includes("Kenya")
          ? "East Africa"
          : "West Africa",
    openTickets: index % 9 === 0 ? 1 : 0,
    idVerified: user.status === "active" && index % 4 !== 0,
    verification: {
      governmentIdType: index % 3 === 0 ? "National ID" : "Passport",
      governmentIdVerified: user.status === "active" && index % 4 !== 0,
      faceMatchVerified: user.status === "active" && index % 4 !== 0,
      provider: "Didit",
    },
    paymentMethods: {
      cardLabel:
        index % 2 === 0 ? "Visa •••• 4471 (GBP)" : "Mastercard •••• 9024 (USD)",
      defaultCurrency: user.currency === "NGN" ? "NGN" : "USD",
    },
    recentBookings: BOOKING_STATUS_POOL.slice(0, 3),
    internalNote:
      index % 7 === 0
        ? {
            text: "Customer contacted support once regarding a booking change. Resolved without escalation.",
            author: "Admin",
            date: "12 May 2026",
          }
        : null,
  };
}

export function getAdminUserDetailById(id: string): AdminUserDetail | undefined {
  const user = getAdminUserById(id);

  if (!user) {
    return undefined;
  }

  const override = USER_DETAIL_OVERRIDES[id];
  const defaults = buildDefaultUserDetail(user);

  return {
    ...defaults,
    ...override,
    verification: {
      ...defaults.verification,
      ...override?.verification,
    },
    paymentMethods: {
      ...defaults.paymentMethods,
      ...override?.paymentMethods,
    },
  };
}

export function formatAdminUserJoinedDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatAdminUserLifetimeSpend(currency: string, amount: number) {
  if (amount >= 1_000_000) {
    return `${currency} ${(amount / 1_000_000).toFixed(1)}m`;
  }

  if (amount >= 1_000) {
    return `${currency} ${(amount / 1_000).toFixed(1)}k`;
  }

  return `${currency} ${amount.toLocaleString("en-GB")}`;
}

export function getAdminUserInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }

  return name.slice(0, 2).toUpperCase();
}

export function filterAdminUsers(users: AdminUser[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return users;
  }

  return users.filter(
    (user) =>
      user.name.toLowerCase().includes(normalizedQuery) ||
      user.accountId.toLowerCase().includes(normalizedQuery) ||
      user.email.toLowerCase().includes(normalizedQuery) ||
      user.location.toLowerCase().includes(normalizedQuery),
  );
}

export function getAdminUserStats(users: AdminUser[]) {
  return {
    total: users.length,
    active: users.filter((user) => user.status === "active").length,
    combinedSpend: users.reduce((sum, user) => sum + user.totalSpend, 0),
    currency: users[0]?.currency ?? "USD",
  };
}

export function paginateAdminUsers(
  users: AdminUser[],
  page: number,
  pageSize = ADMIN_USERS_PAGE_SIZE,
) {
  const totalPages = Math.max(1, Math.ceil(users.length / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * pageSize;

  return {
    items: users.slice(start, start + pageSize),
    currentPage,
    totalPages,
  };
}

export function formatAdminUserLastTrip(date: string) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
}
