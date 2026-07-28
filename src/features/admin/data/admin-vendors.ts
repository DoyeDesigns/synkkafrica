export type AdminVendorStatus = "active" | "inactive";

export type AdminVendorDocumentStatus =
  | "verified"
  | "pending"
  | "signed"
  | "notVerified";

export type AdminVendorDocument = {
  label: string;
  status: AdminVendorDocumentStatus;
};

export type AdminVendor = {
  id: string;
  accountId: string;
  name: string;
  email: string;
  phone: string;
  listingsCount: number;
  commissionRate: number;
  revenue: number;
  currency: string;
  rating: number;
  reviewCount: number;
  status: AdminVendorStatus;
  joinedAt: string;
  description: string;
};

export type AdminVendorDetail = AdminVendor & {
  category: string;
  tier: number;
  tierLabel: string;
  location: string;
  activeListings: number;
  completedBookings: number;
  openStrikes: number;
  accountDocuments: AdminVendorDocument[];
  listingDocuments: AdminVendorDocument[];
  payout: {
    pendingAmount: number;
    currency: string;
    lastPayoutDate: string;
    commissionRate: number;
  };
  internalNote: {
    text: string;
    author: string;
    date: string;
  } | null;
};

export const ADMIN_VENDOR_MAX_TIER = 3;

export const ADMIN_VENDOR_REQUESTABLE_DOCUMENTS = [
  "Government ID (NIN)",
  "CAC registration",
  "BVN",
  "Vehicle registration",
  "Roadworthiness certificate",
  "Comprehensive insurance",
  "GPS tracker acknowledgment",
  "Business license",
  "Tax identification",
  "Proof of address",
  "Bank account verification",
] as const;

const ADMIN_VENDOR_TIER_NAMES: Record<number, string> = {
  1: "Individual",
  2: "Registered business",
  3: "Enterprise partner",
};

export function getAdminVendorTierLabel(tier: number) {
  const name = ADMIN_VENDOR_TIER_NAMES[tier];

  return name ? `Tier ${tier} — ${name}` : `Tier ${tier}`;
}

export function getAdminVendorNextTier(tier: number) {
  return tier < ADMIN_VENDOR_MAX_TIER ? tier + 1 : null;
}

export const ADMIN_VENDORS_PAGE_SIZE = 20;

const BASE_ADMIN_VENDORS: AdminVendor[] = [
  {
    id: "vendor-alex",
    accountId: "VND-00214",
    name: "Alex Autos",
    email: "alex.autos@email.com",
    phone: "+234 802 000 1122",
    listingsCount: 34,
    commissionRate: 15,
    revenue: 8420000,
    currency: "NGN",
    rating: 4.6,
    reviewCount: 128,
    status: "active",
    joinedAt: "2026-03-12",
    description:
      "Car rentals and curated Lagos experiences. Fleet-focused vendor with airport pickup coverage.",
  },
  {
    id: "vendor-coastal",
    accountId: "VND-00227",
    name: "Coastal Trails NG",
    email: "hello@coastaltrails.ng",
    phone: "+234 701 882 9031",
    listingsCount: 5,
    commissionRate: 15,
    revenue: 5120000,
    currency: "NGN",
    rating: 4.5,
    reviewCount: 86,
    status: "active",
    joinedAt: "2026-01-08",
    description:
      "Boat tours, coastal day trips, and waterfront experiences across Lagos and Badagry.",
  },
  {
    id: "vendor-luxe",
    accountId: "VND-00318",
    name: "Luxe Lagos Stays",
    email: "ops@luxelagos.ng",
    phone: "+234 809 440 1122",
    listingsCount: 2,
    commissionRate: 10,
    revenue: 2100000,
    currency: "NGN",
    rating: 3.9,
    reviewCount: 34,
    status: "inactive",
    joinedAt: "2026-03-22",
    description:
      "Boutique apartment stays in Victoria Island and Lekki with concierge check-in.",
  },
  {
    id: "vendor-safari",
    accountId: "VND-00402",
    name: "Safari Connect Tours",
    email: "bookings@safariconnect.ng",
    phone: "+234 706 119 8834",
    listingsCount: 7,
    commissionRate: 14,
    revenue: 9650000,
    currency: "NGN",
    rating: 4.8,
    reviewCount: 201,
    status: "active",
    joinedAt: "2025-09-03",
    description:
      "Multi-day safari packages and guided wildlife tours across West Africa.",
  },
];

const EXTRA_VENDOR_NAMES = [
  "Harbour View Rentals",
  "Golden Palm Hospitality",
  "Metro Ride Lagos",
  "Island Escape Tours",
  "Delta River Cruises",
  "Skyline Apartments",
  "Heritage Food Walks",
  "Blue Lagoon Adventures",
  "Urban Nest Stays",
  "Prime Fleet Services",
];

function buildAdminVendors(): AdminVendor[] {
  const generated = Array.from({ length: 56 }, (_, index) => {
    const template = BASE_ADMIN_VENDORS[index % BASE_ADMIN_VENDORS.length]!;
    const sequence = index + 5;

    return {
      ...template,
      id: `vendor-${sequence}`,
      accountId: `VND-${String(sequence).padStart(5, "0")}`,
      name: EXTRA_VENDOR_NAMES[index % EXTRA_VENDOR_NAMES.length] ?? `Vendor ${sequence}`,
      email: `vendor${sequence}@synkvendor.ng`,
      phone: `+234 80${String(1000000 + sequence).slice(0, 8)}`,
      listingsCount: (template.listingsCount + (index % 4)) % 9 || 1,
      commissionRate: 10 + (index % 6),
      revenue: template.revenue + index * 125000,
      rating: Math.round((3.8 + (index % 12) * 0.1) * 10) / 10,
      reviewCount: 20 + index * 3,
      status: index % 5 === 0 ? "inactive" : "active",
      joinedAt: `2025-${String((index % 12) + 1).padStart(2, "0")}-${String((index % 27) + 1).padStart(2, "0")}`,
      description: template.description,
    } satisfies AdminVendor;
  });

  return [...BASE_ADMIN_VENDORS, ...generated];
}

export const ADMIN_VENDORS: AdminVendor[] = buildAdminVendors();

export function getAdminVendorById(id: string) {
  return ADMIN_VENDORS.find((vendor) => vendor.id === id);
}

const VENDOR_DETAIL_OVERRIDES: Partial<
  Record<string, Omit<AdminVendorDetail, keyof AdminVendor>>
> = {
  "vendor-alex": {
    category: "Cars",
    tier: 2,
    tierLabel: getAdminVendorTierLabel(2),
    location: "Lagos, NG",
    activeListings: 34,
    completedBookings: 128,
    openStrikes: 2,
    accountDocuments: [
      { label: "Government ID (NIN)", status: "verified" },
      { label: "CAC registration", status: "verified" },
      { label: "BVN", status: "verified" },
    ],
    listingDocuments: [
      { label: "Vehicle registration", status: "verified" },
      { label: "Roadworthiness certificate", status: "verified" },
      { label: "Comprehensive insurance", status: "pending" },
      { label: "GPS tracker acknowledgment", status: "signed" },
    ],
    payout: {
      pendingAmount: 340000,
      currency: "NGN",
      lastPayoutDate: "2026-07-14",
      commissionRate: 15,
    },
    internalNote: {
      text: "Two late-arrival complaints in June — flagged for driver punctuality. Vendor responded and apologized. Watch next 3 bookings.",
      author: "Admin",
      date: "03 Jul 2026",
    },
  },
};

function buildDefaultVendorDetail(vendor: AdminVendor): AdminVendorDetail {
  const index = Number.parseInt(vendor.id.replace(/\D/g, ""), 10) || 0;
  const category =
    vendor.name.includes("Stay") || vendor.name.includes("Apartment")
      ? "Accommodations"
      : vendor.name.includes("Tour") || vendor.name.includes("Safari")
        ? "Experiences"
        : "Cars";

  const tier = index % 3 === 0 ? 3 : index % 2 === 0 ? 2 : 1;

  return {
    ...vendor,
    category,
    tier,
    tierLabel: getAdminVendorTierLabel(tier),
    location: "Lagos, NG",
    activeListings: vendor.listingsCount,
    completedBookings: vendor.reviewCount,
    openStrikes: index % 8 === 0 ? 1 : 0,
    accountDocuments: [
      { label: "Government ID (NIN)", status: vendor.status === "active" ? "verified" : "pending" },
      { label: "CAC registration", status: index % 3 === 0 ? "verified" : "notVerified" },
      { label: "BVN", status: vendor.status === "active" ? "verified" : "notVerified" },
    ],
    listingDocuments: [
      { label: "Vehicle registration", status: "verified" },
      { label: "Roadworthiness certificate", status: "verified" },
      { label: "Comprehensive insurance", status: index % 4 === 0 ? "pending" : "verified" },
      { label: "GPS tracker acknowledgment", status: "signed" },
    ],
    payout: {
      pendingAmount: Math.round(vendor.revenue * 0.04),
      currency: vendor.currency,
      lastPayoutDate: "2026-07-14",
      commissionRate: vendor.commissionRate,
    },
    internalNote:
      index % 5 === 0
        ? {
            text: "Vendor onboarding completed without issues. Monitor first payout cycle.",
            author: "Admin",
            date: "15 Jun 2026",
          }
        : null,
  };
}

export function getAdminVendorDetailById(id: string): AdminVendorDetail | undefined {
  const vendor = getAdminVendorById(id);

  if (!vendor) {
    return undefined;
  }

  const override = VENDOR_DETAIL_OVERRIDES[id];
  const defaults = buildDefaultVendorDetail(vendor);

  return {
    ...defaults,
    ...override,
    tier: override?.tier ?? defaults.tier,
    tierLabel: getAdminVendorTierLabel(override?.tier ?? defaults.tier),
    accountDocuments: override?.accountDocuments ?? defaults.accountDocuments,
    listingDocuments: override?.listingDocuments ?? defaults.listingDocuments,
    payout: {
      ...defaults.payout,
      ...override?.payout,
    },
  };
}

export function formatAdminVendorOnboardedDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatAdminVendorPayoutDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function filterAdminVendors(vendors: AdminVendor[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return vendors;
  }

  return vendors.filter(
    (vendor) =>
      vendor.name.toLowerCase().includes(normalizedQuery) ||
      vendor.accountId.toLowerCase().includes(normalizedQuery) ||
      vendor.email.toLowerCase().includes(normalizedQuery) ||
      vendor.phone.toLowerCase().includes(normalizedQuery),
  );
}

export function getAdminVendorStats(vendors: AdminVendor[]) {
  return {
    total: vendors.length,
    active: vendors.filter((vendor) => vendor.status === "active").length,
    combinedRevenue: vendors.reduce((sum, vendor) => sum + vendor.revenue, 0),
    currency: vendors[0]?.currency ?? "NGN",
  };
}

export function paginateAdminVendors(
  vendors: AdminVendor[],
  page: number,
  pageSize = ADMIN_VENDORS_PAGE_SIZE,
) {
  const totalPages = Math.max(1, Math.ceil(vendors.length / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * pageSize;

  return {
    items: vendors.slice(start, start + pageSize),
    currentPage,
    totalPages,
  };
}
