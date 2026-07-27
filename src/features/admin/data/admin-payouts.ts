export type AdminPayoutStatus = "pending" | "completed" | "declined" | "failed";

export type AdminPayoutBooking = {
  id: string;
  amount: number;
};

export type AdminPayout = {
  id: string;
  referenceId: string;
  vendorName: string;
  vendorId: string;
  category: string;
  amount: number;
  currency: string;
  grossEarnings: number;
  commissionRate: number;
  commissionAmount: number;
  netPayout: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  payoutMethod: string;
  requestedAt: string;
  periodStart: string;
  periodEnd: string;
  bookingsCount: number;
  associatedBookings: AdminPayoutBooking[];
  internalNote: {
    text: string;
    author: string;
    date: string;
  } | null;
  status: AdminPayoutStatus;
};

export const ADMIN_PAYOUTS: AdminPayout[] = [
  {
    id: "pay-1",
    referenceId: "REF-PO-10234",
    vendorName: "Alex Autos",
    vendorId: "vendor-alex",
    category: "Cars",
    amount: 200000,
    currency: "NGN",
    grossEarnings: 235300,
    commissionRate: 15,
    commissionAmount: 35300,
    netPayout: 200000,
    bankName: "GTBank",
    accountNumber: "****4521",
    accountName: "Alex Autos Ltd",
    payoutMethod: "Bank transfer",
    requestedAt: "2026-07-18",
    periodStart: "2026-07-01",
    periodEnd: "2026-07-18",
    bookingsCount: 4,
    associatedBookings: [
      { id: "BKG-5521", amount: 62000 },
      { id: "BKG-5518", amount: 58000 },
      { id: "BKG-5509", amount: 41000 },
      { id: "BKG-5497", amount: 39000 },
    ],
    internalNote: {
      text: "Vendor has 1 open dispute on a prior booking. Review before approving this payout.",
      author: "Admin",
      date: "19 Jul 2026",
    },
    status: "pending",
  },
  {
    id: "pay-2",
    referenceId: "REF-PO-10241",
    vendorName: "Coastal Trails NG",
    vendorId: "vendor-coastal",
    category: "Experiences",
    amount: 150000,
    currency: "NGN",
    grossEarnings: 176470,
    commissionRate: 15,
    commissionAmount: 26470,
    netPayout: 150000,
    bankName: "Access Bank",
    accountNumber: "****8834",
    accountName: "Coastal Trails Nigeria",
    payoutMethod: "Bank transfer",
    requestedAt: "2026-07-18",
    periodStart: "2026-07-01",
    periodEnd: "2026-07-18",
    bookingsCount: 3,
    associatedBookings: [
      { id: "BKG-5530", amount: 52000 },
      { id: "BKG-5524", amount: 48000 },
      { id: "BKG-5511", amount: 50000 },
    ],
    internalNote: null,
    status: "pending",
  },
  {
    id: "pay-3",
    referenceId: "REF-PO-10208",
    vendorName: "Luxe Lagos Stays",
    vendorId: "vendor-luxe",
    category: "Accommodations",
    amount: 180000,
    currency: "NGN",
    grossEarnings: 211765,
    commissionRate: 15,
    commissionAmount: 31765,
    netPayout: 180000,
    bankName: "Zenith Bank",
    accountNumber: "****2290",
    accountName: "Luxe Lagos Stays Ltd",
    payoutMethod: "Bank transfer",
    requestedAt: "2026-07-15",
    periodStart: "2026-07-01",
    periodEnd: "2026-07-15",
    bookingsCount: 5,
    associatedBookings: [
      { id: "BKG-5488", amount: 42000 },
      { id: "BKG-5476", amount: 38000 },
      { id: "BKG-5465", amount: 35000 },
      { id: "BKG-5452", amount: 33000 },
      { id: "BKG-5440", amount: 32000 },
    ],
    internalNote: null,
    status: "pending",
  },
  {
    id: "pay-4",
    referenceId: "REF-PO-10192",
    vendorName: "Safari Connect Tours",
    vendorId: "vendor-safari",
    category: "Experiences",
    amount: 120000,
    currency: "NGN",
    grossEarnings: 141176,
    commissionRate: 15,
    commissionAmount: 21176,
    netPayout: 120000,
    bankName: "UBA",
    accountNumber: "****7712",
    accountName: "Safari Connect Tours",
    payoutMethod: "Bank transfer",
    requestedAt: "2026-07-12",
    periodStart: "2026-07-01",
    periodEnd: "2026-07-12",
    bookingsCount: 2,
    associatedBookings: [
      { id: "BKG-5421", amount: 65000 },
      { id: "BKG-5410", amount: 55000 },
    ],
    internalNote: null,
    status: "pending",
  },
  {
    id: "pay-5",
    referenceId: "REF-PO-10185",
    vendorName: "Harbour View Rentals",
    vendorId: "vendor-48050",
    category: "Cars",
    amount: 95000,
    currency: "NGN",
    grossEarnings: 111765,
    commissionRate: 15,
    commissionAmount: 16765,
    netPayout: 95000,
    bankName: "First Bank",
    accountNumber: "****3344",
    accountName: "Harbour View Rentals",
    payoutMethod: "Bank transfer",
    requestedAt: "2026-07-10",
    periodStart: "2026-07-01",
    periodEnd: "2026-07-10",
    bookingsCount: 2,
    associatedBookings: [
      { id: "BKG-5398", amount: 50000 },
      { id: "BKG-5387", amount: 45000 },
    ],
    internalNote: null,
    status: "pending",
  },
  {
    id: "pay-6",
    referenceId: "REF-PO-10178",
    vendorName: "Golden Palm Hospitality",
    vendorId: "vendor-48051",
    category: "Accommodations",
    amount: 105000,
    currency: "NGN",
    grossEarnings: 123529,
    commissionRate: 15,
    commissionAmount: 18529,
    netPayout: 105000,
    bankName: "Stanbic IBTC",
    accountNumber: "****9981",
    accountName: "Golden Palm Hospitality",
    payoutMethod: "Bank transfer",
    requestedAt: "2026-07-08",
    periodStart: "2026-07-01",
    periodEnd: "2026-07-08",
    bookingsCount: 3,
    associatedBookings: [
      { id: "BKG-5375", amount: 38000 },
      { id: "BKG-5364", amount: 35000 },
      { id: "BKG-5352", amount: 32000 },
    ],
    internalNote: null,
    status: "pending",
  },
  {
    id: "pay-7",
    referenceId: "REF-PO-10160",
    vendorName: "Alex Autos",
    vendorId: "vendor-alex",
    category: "Cars",
    amount: 320000,
    currency: "NGN",
    grossEarnings: 376470,
    commissionRate: 15,
    commissionAmount: 56470,
    netPayout: 320000,
    bankName: "GTBank",
    accountNumber: "****4521",
    accountName: "Alex Autos Ltd",
    payoutMethod: "Bank transfer",
    requestedAt: "2026-06-28",
    periodStart: "2026-06-01",
    periodEnd: "2026-06-28",
    bookingsCount: 6,
    associatedBookings: [
      { id: "BKG-5280", amount: 58000 },
      { id: "BKG-5271", amount: 54000 },
      { id: "BKG-5260", amount: 52000 },
      { id: "BKG-5248", amount: 50000 },
      { id: "BKG-5235", amount: 48000 },
      { id: "BKG-5220", amount: 46000 },
    ],
    internalNote: null,
    status: "completed",
  },
  {
    id: "pay-8",
    referenceId: "REF-PO-10155",
    vendorName: "Coastal Trails NG",
    vendorId: "vendor-coastal",
    category: "Experiences",
    amount: 280000,
    currency: "NGN",
    grossEarnings: 329412,
    commissionRate: 15,
    commissionAmount: 49412,
    netPayout: 280000,
    bankName: "Access Bank",
    accountNumber: "****8834",
    accountName: "Coastal Trails Nigeria",
    payoutMethod: "Bank transfer",
    requestedAt: "2026-06-25",
    periodStart: "2026-06-01",
    periodEnd: "2026-06-25",
    bookingsCount: 5,
    associatedBookings: [
      { id: "BKG-5210", amount: 60000 },
      { id: "BKG-5198", amount: 55000 },
      { id: "BKG-5185", amount: 52000 },
      { id: "BKG-5172", amount: 58000 },
      { id: "BKG-5160", amount: 55000 },
    ],
    internalNote: null,
    status: "completed",
  },
  {
    id: "pay-9",
    referenceId: "REF-PO-10148",
    vendorName: "Safari Connect Tours",
    vendorId: "vendor-safari",
    category: "Experiences",
    amount: 410000,
    currency: "NGN",
    grossEarnings: 482353,
    commissionRate: 15,
    commissionAmount: 72353,
    netPayout: 410000,
    bankName: "UBA",
    accountNumber: "****7712",
    accountName: "Safari Connect Tours",
    payoutMethod: "Bank transfer",
    requestedAt: "2026-06-22",
    periodStart: "2026-06-01",
    periodEnd: "2026-06-22",
    bookingsCount: 8,
    associatedBookings: [
      { id: "BKG-5150", amount: 55000 },
      { id: "BKG-5140", amount: 52000 },
      { id: "BKG-5130", amount: 50000 },
      { id: "BKG-5120", amount: 48000 },
    ],
    internalNote: null,
    status: "completed",
  },
  {
    id: "pay-10",
    referenceId: "REF-PO-10140",
    vendorName: "Luxe Lagos Stays",
    vendorId: "vendor-luxe",
    category: "Accommodations",
    amount: 350000,
    currency: "NGN",
    grossEarnings: 411765,
    commissionRate: 15,
    commissionAmount: 61765,
    netPayout: 350000,
    bankName: "Zenith Bank",
    accountNumber: "****2290",
    accountName: "Luxe Lagos Stays Ltd",
    payoutMethod: "Bank transfer",
    requestedAt: "2026-06-20",
    periodStart: "2026-06-01",
    periodEnd: "2026-06-20",
    bookingsCount: 7,
    associatedBookings: [
      { id: "BKG-5100", amount: 52000 },
      { id: "BKG-5090", amount: 50000 },
      { id: "BKG-5080", amount: 48000 },
    ],
    internalNote: null,
    status: "completed",
  },
  {
    id: "pay-11",
    referenceId: "REF-PO-10132",
    vendorName: "Metro Ride Lagos",
    vendorId: "vendor-48052",
    category: "Cars",
    amount: 220000,
    currency: "NGN",
    grossEarnings: 258824,
    commissionRate: 15,
    commissionAmount: 38824,
    netPayout: 220000,
    bankName: "GTBank",
    accountNumber: "****6612",
    accountName: "Metro Ride Lagos",
    payoutMethod: "Bank transfer",
    requestedAt: "2026-06-18",
    periodStart: "2026-06-01",
    periodEnd: "2026-06-18",
    bookingsCount: 4,
    associatedBookings: [
      { id: "BKG-5070", amount: 58000 },
      { id: "BKG-5060", amount: 55000 },
    ],
    internalNote: null,
    status: "completed",
  },
  {
    id: "pay-12",
    referenceId: "REF-PO-10125",
    vendorName: "Island Escape Tours",
    vendorId: "vendor-48053",
    category: "Experiences",
    amount: 190000,
    currency: "NGN",
    grossEarnings: 223529,
    commissionRate: 15,
    commissionAmount: 33529,
    netPayout: 190000,
    bankName: "Access Bank",
    accountNumber: "****5523",
    accountName: "Island Escape Tours",
    payoutMethod: "Bank transfer",
    requestedAt: "2026-06-15",
    periodStart: "2026-06-01",
    periodEnd: "2026-06-15",
    bookingsCount: 3,
    associatedBookings: [
      { id: "BKG-5050", amount: 65000 },
      { id: "BKG-5040", amount: 62000 },
    ],
    internalNote: null,
    status: "completed",
  },
  {
    id: "pay-13",
    referenceId: "REF-PO-10118",
    vendorName: "Delta River Cruises",
    vendorId: "vendor-48054",
    category: "Experiences",
    amount: 260000,
    currency: "NGN",
    grossEarnings: 305882,
    commissionRate: 15,
    commissionAmount: 45882,
    netPayout: 260000,
    bankName: "First Bank",
    accountNumber: "****4410",
    accountName: "Delta River Cruises",
    payoutMethod: "Bank transfer",
    requestedAt: "2026-06-12",
    periodStart: "2026-06-01",
    periodEnd: "2026-06-12",
    bookingsCount: 4,
    associatedBookings: [
      { id: "BKG-5030", amount: 68000 },
      { id: "BKG-5020", amount: 64000 },
    ],
    internalNote: null,
    status: "completed",
  },
  {
    id: "pay-14",
    referenceId: "REF-PO-10110",
    vendorName: "Skyline Apartments",
    vendorId: "vendor-48055",
    category: "Accommodations",
    amount: 310000,
    currency: "NGN",
    grossEarnings: 364706,
    commissionRate: 15,
    commissionAmount: 54706,
    netPayout: 310000,
    bankName: "Stanbic IBTC",
    accountNumber: "****7788",
    accountName: "Skyline Apartments",
    payoutMethod: "Bank transfer",
    requestedAt: "2026-06-10",
    periodStart: "2026-06-01",
    periodEnd: "2026-06-10",
    bookingsCount: 5,
    associatedBookings: [
      { id: "BKG-5010", amount: 64000 },
      { id: "BKG-5000", amount: 62000 },
    ],
    internalNote: null,
    status: "completed",
  },
  {
    id: "pay-15",
    referenceId: "REF-PO-10102",
    vendorName: "Heritage Food Walks",
    vendorId: "vendor-48056",
    category: "Experiences",
    amount: 170000,
    currency: "NGN",
    grossEarnings: 200000,
    commissionRate: 15,
    commissionAmount: 30000,
    netPayout: 170000,
    bankName: "UBA",
    accountNumber: "****3321",
    accountName: "Heritage Food Walks",
    payoutMethod: "Bank transfer",
    requestedAt: "2026-06-08",
    periodStart: "2026-06-01",
    periodEnd: "2026-06-08",
    bookingsCount: 3,
    associatedBookings: [
      { id: "BKG-4990", amount: 58000 },
      { id: "BKG-4980", amount: 56000 },
    ],
    internalNote: null,
    status: "completed",
  },
  {
    id: "pay-16",
    referenceId: "REF-PO-10095",
    vendorName: "Metro Ride Lagos",
    vendorId: "vendor-48052",
    category: "Cars",
    amount: 400000,
    currency: "NGN",
    grossEarnings: 470588,
    commissionRate: 15,
    commissionAmount: 70588,
    netPayout: 400000,
    bankName: "GTBank",
    accountNumber: "****6612",
    accountName: "Metro Ride Lagos",
    payoutMethod: "Bank transfer",
    requestedAt: "2026-06-05",
    periodStart: "2026-06-01",
    periodEnd: "2026-06-05",
    bookingsCount: 6,
    associatedBookings: [
      { id: "BKG-4970", amount: 70000 },
      { id: "BKG-4960", amount: 68000 },
    ],
    internalNote: null,
    status: "completed",
  },
  {
    id: "pay-17",
    referenceId: "REF-PO-10088",
    vendorName: "Golden Palm Hospitality",
    vendorId: "vendor-48051",
    category: "Accommodations",
    amount: 160000,
    currency: "NGN",
    grossEarnings: 188235,
    commissionRate: 15,
    commissionAmount: 28235,
    netPayout: 160000,
    bankName: "Stanbic IBTC",
    accountNumber: "****9981",
    accountName: "Golden Palm Hospitality",
    payoutMethod: "Bank transfer",
    requestedAt: "2026-07-05",
    periodStart: "2026-07-01",
    periodEnd: "2026-07-05",
    bookingsCount: 2,
    associatedBookings: [{ id: "BKG-5340", amount: 80000 }],
    internalNote: {
      text: "Payout declined — missing updated CAC certificate on file.",
      author: "Admin",
      date: "06 Jul 2026",
    },
    status: "declined",
  },
  {
    id: "pay-18",
    referenceId: "REF-PO-10080",
    vendorName: "Harbour View Rentals",
    vendorId: "vendor-48050",
    category: "Cars",
    amount: 100000,
    currency: "NGN",
    grossEarnings: 117647,
    commissionRate: 15,
    commissionAmount: 17647,
    netPayout: 100000,
    bankName: "First Bank",
    accountNumber: "****3344",
    accountName: "Harbour View Rentals",
    payoutMethod: "Bank transfer",
    requestedAt: "2026-07-03",
    periodStart: "2026-07-01",
    periodEnd: "2026-07-03",
    bookingsCount: 1,
    associatedBookings: [{ id: "BKG-5330", amount: 100000 }],
    internalNote: null,
    status: "failed",
  },
];

export function getAdminPayoutById(id: string) {
  return ADMIN_PAYOUTS.find((payout) => payout.id === id);
}

export function filterAdminPayouts(
  payouts: AdminPayout[],
  query: string,
  status: AdminPayoutStatus | "all",
) {
  const normalizedQuery = query.trim().toLowerCase();

  return payouts.filter((payout) => {
    const matchesStatus = status === "all" || payout.status === status;
    const matchesQuery =
      !normalizedQuery ||
      payout.vendorName.toLowerCase().includes(normalizedQuery) ||
      payout.referenceId.toLowerCase().includes(normalizedQuery);

    return matchesStatus && matchesQuery;
  });
}

export function getAdminPayoutStats(payouts: AdminPayout[]) {
  const sumByStatus = (status: AdminPayoutStatus) =>
    payouts
      .filter((payout) => payout.status === status)
      .reduce((sum, payout) => sum + payout.netPayout, 0);

  const countByStatus = (status: AdminPayoutStatus) =>
    payouts.filter((payout) => payout.status === status).length;

  return {
    total: payouts.reduce((sum, payout) => sum + payout.netPayout, 0),
    vendorCount: payouts.length,
    pending: sumByStatus("pending"),
    pendingCount: countByStatus("pending"),
    completed: sumByStatus("completed"),
    completedCount: countByStatus("completed"),
    declined: sumByStatus("declined"),
    declinedCount: countByStatus("declined"),
    failed: sumByStatus("failed"),
    failedCount: countByStatus("failed"),
    currency: payouts[0]?.currency ?? "NGN",
  };
}

export function formatAdminPayoutDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatAdminPayoutPeriod(start: string, end: string) {
  const startDay = new Intl.DateTimeFormat("en-GB", { day: "2-digit" }).format(new Date(start));
  const endDay = new Intl.DateTimeFormat("en-GB", { day: "2-digit" }).format(new Date(end));
  const monthYear = new Intl.DateTimeFormat("en-GB", {
    month: "short",
    year: "numeric",
  }).format(new Date(end));

  return `${startDay}–${endDay} ${monthYear}`;
}

export function formatAdminPayoutCompactAmount(currency: string, amount: number) {
  if (amount >= 1_000_000) {
    return `${currency} ${(amount / 1_000_000).toFixed(2)}m`;
  }

  return `${currency} ${amount.toLocaleString("en-GB")}`;
}
