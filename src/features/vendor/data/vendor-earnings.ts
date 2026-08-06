export type VendorTransactionType = "credit" | "debit";
export type VendorTransactionStatus = "completed" | "pending" | "failed";
export type EarningsDuration = "daily" | "weekly" | "monthly" | "all";

export type VendorTransaction = {
  id: string;
  title: string;
  descriptionKey:
    | "vendor.earnings.transaction.bookingPayment"
    | "vendor.earnings.transaction.withdrawal"
    | "vendor.earnings.transaction.platformFee"
    | "vendor.earnings.transaction.refund";
  date: string;
  amount: number;
  currency: string;
  type: VendorTransactionType;
  status: VendorTransactionStatus;
};

export type VendorBankAccount = {
  id: string;
  labelKey: "vendor.earnings.bank.gtbank" | "vendor.earnings.bank.access";
  accountNumber: string;
};

export type VendorEarningsSummary = {
  availableBalance: number;
  lifetimeEarnings: number;
  currency: string;
};

export type CommissionSplitSummary = {
  grossRevenue: number;
  vendorShare: number;
  platformFee: number;
  currency: string;
};

export const EARNINGS_DURATION_OPTIONS: EarningsDuration[] = [
  "daily",
  "weekly",
  "monthly",
  "all",
];

export const VENDOR_COMMISSION_SPLIT = {
  vendorSharePercent: 85,
  platformSharePercent: 15,
} as const;

export const VENDOR_EARNINGS_SUMMARY: VendorEarningsSummary = {
  availableBalance: 842_000,
  lifetimeEarnings: 842_000,
  currency: "NGN",
};

export const VENDOR_BANK_ACCOUNTS: VendorBankAccount[] = [
  {
    id: "gtbank",
    labelKey: "vendor.earnings.bank.gtbank",
    accountNumber: "****4521",
  },
  {
    id: "access",
    labelKey: "vendor.earnings.bank.access",
    accountNumber: "****8834",
  },
];

export const VENDOR_TRANSACTIONS: VendorTransaction[] = [
  {
    id: "txn-1",
    title: "Lekki Garden Suites",
    descriptionKey: "vendor.earnings.transaction.bookingPayment",
    date: "2026-07-21",
    amount: 102_000,
    currency: "NGN",
    type: "credit",
    status: "completed",
  },
  {
    id: "txn-2",
    title: "Lagos Lagoon Sunset Cruise",
    descriptionKey: "vendor.earnings.transaction.bookingPayment",
    date: "2026-07-20",
    amount: 72_250,
    currency: "NGN",
    type: "credit",
    status: "completed",
  },
  {
    id: "txn-3",
    title: "Toyota Camry 2021",
    descriptionKey: "vendor.earnings.transaction.bookingPayment",
    date: "2026-07-15",
    amount: 38_250,
    currency: "NGN",
    type: "credit",
    status: "completed",
  },
  {
    id: "txn-4",
    title: "GTBank",
    descriptionKey: "vendor.earnings.transaction.withdrawal",
    date: "2026-07-10",
    amount: 200_000,
    currency: "NGN",
    type: "debit",
    status: "completed",
  },
  {
    id: "txn-5",
    title: "Lagos Food Experience",
    descriptionKey: "vendor.earnings.transaction.bookingPayment",
    date: "2026-07-19",
    amount: 27_200,
    currency: "NGN",
    type: "credit",
    status: "pending",
  },
  {
    id: "txn-6",
    title: "Synkafrica",
    descriptionKey: "vendor.earnings.transaction.platformFee",
    date: "2026-07-21",
    amount: 18_000,
    currency: "NGN",
    type: "debit",
    status: "completed",
  },
  {
    id: "txn-7",
    title: "Tarkwa Bay Boat Tour",
    descriptionKey: "vendor.earnings.transaction.bookingPayment",
    date: "2026-03-08",
    amount: 38_675,
    currency: "NGN",
    type: "credit",
    status: "completed",
  },
];

function startOfDay(date: Date) {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

export function filterTransactionsByDuration(
  transactions: VendorTransaction[],
  duration: EarningsDuration,
  referenceDate = new Date(),
): VendorTransaction[] {
  if (duration === "all") {
    return transactions;
  }

  const end = startOfDay(referenceDate);
  const start = new Date(end);

  switch (duration) {
    case "daily":
      return transactions.filter((transaction) => {
        const transactionDate = startOfDay(new Date(transaction.date));
        return transactionDate.getTime() === end.getTime();
      });
    case "weekly":
      start.setDate(start.getDate() - 6);
      break;
    case "monthly":
      start.setDate(start.getDate() - 29);
      break;
  }

  return transactions.filter((transaction) => {
    const transactionDate = startOfDay(new Date(transaction.date));
    return transactionDate >= start && transactionDate <= end;
  });
}

export function computeCommissionSplitSummary(
  transactions: VendorTransaction[],
): CommissionSplitSummary {
  const currency =
    transactions[0]?.currency ?? VENDOR_EARNINGS_SUMMARY.currency;

  const bookingCredits = transactions.filter(
    (transaction) =>
      transaction.type === "credit" &&
      transaction.descriptionKey === "vendor.earnings.transaction.bookingPayment",
  );

  const vendorShare = bookingCredits.reduce(
    (total, transaction) => total + transaction.amount,
    0,
  );

  const explicitPlatformFees = transactions
    .filter(
      (transaction) =>
        transaction.type === "debit" &&
        transaction.descriptionKey === "vendor.earnings.transaction.platformFee",
    )
    .reduce((total, transaction) => total + transaction.amount, 0);

  const calculatedPlatformFee = Math.round(
    (vendorShare * VENDOR_COMMISSION_SPLIT.platformSharePercent) /
      VENDOR_COMMISSION_SPLIT.vendorSharePercent,
  );

  const platformFee =
    explicitPlatformFees > 0 ? explicitPlatformFees : calculatedPlatformFee;
  const grossRevenue = vendorShare + platformFee;

  return {
    grossRevenue,
    vendorShare,
    platformFee,
    currency,
  };
}

export function buildEarningsStatementCsv(
  transactions: VendorTransaction[],
  labels: Record<string, string>,
) {
  const headers = [
    labels.date,
    labels.title,
    labels.description,
    labels.type,
    labels.amount,
    labels.status,
  ];

  const rows = transactions.map((transaction) => [
    transaction.date,
    `"${transaction.title.replace(/"/g, '""')}"`,
    `"${labels[transaction.descriptionKey]?.replace(/"/g, '""') ?? transaction.descriptionKey}"`,
    transaction.type,
    String(transaction.amount),
    labels[transaction.status] ?? transaction.status,
  ]);

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}
