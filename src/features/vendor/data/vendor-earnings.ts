export type VendorTransactionType = "credit" | "debit";
export type VendorTransactionStatus = "completed" | "pending" | "failed";

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
    date: "2026-03-12",
    amount: 120_000,
    currency: "NGN",
    type: "credit",
    status: "completed",
  },
  {
    id: "txn-2",
    title: "Toyota Camry 2021",
    descriptionKey: "vendor.earnings.transaction.bookingPayment",
    date: "2026-03-10",
    amount: 85_000,
    currency: "NGN",
    type: "credit",
    status: "completed",
  },
  {
    id: "txn-3",
    title: "Tarkwa Bay Boat Tour",
    descriptionKey: "vendor.earnings.transaction.bookingPayment",
    date: "2026-03-08",
    amount: 45_500,
    currency: "NGN",
    type: "credit",
    status: "completed",
  },
  {
    id: "txn-4",
    title: "GTBank",
    descriptionKey: "vendor.earnings.transaction.withdrawal",
    date: "2026-03-05",
    amount: 200_000,
    currency: "NGN",
    type: "debit",
    status: "completed",
  },
  {
    id: "txn-5",
    title: "Lagos Food Experience",
    descriptionKey: "vendor.earnings.transaction.bookingPayment",
    date: "2026-03-14",
    amount: 32_000,
    currency: "NGN",
    type: "credit",
    status: "pending",
  },
  {
    id: "txn-6",
    title: "Synkkafrica",
    descriptionKey: "vendor.earnings.transaction.platformFee",
    date: "2026-03-12",
    amount: 5_000,
    currency: "NGN",
    type: "debit",
    status: "completed",
  },
];
