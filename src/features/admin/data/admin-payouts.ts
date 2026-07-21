export type AdminPayoutStatus = "pending" | "completed" | "failed";

export type AdminPayout = {
  id: string;
  vendorName: string;
  amount: number;
  currency: string;
  bankName: string;
  accountNumber: string;
  requestedAt: string;
  status: AdminPayoutStatus;
};

export const ADMIN_PAYOUTS: AdminPayout[] = [
  {
    id: "pay-1",
    vendorName: "Alex Autos",
    amount: 200000,
    currency: "NGN",
    bankName: "GTBank",
    accountNumber: "****4521",
    requestedAt: "2026-07-10",
    status: "pending",
  },
  {
    id: "pay-2",
    vendorName: "Coastal Trails NG",
    amount: 150000,
    currency: "NGN",
    bankName: "Access Bank",
    accountNumber: "****8834",
    requestedAt: "2026-07-18",
    status: "pending",
  },
  {
    id: "pay-3",
    vendorName: "Alex Autos",
    amount: 320000,
    currency: "NGN",
    bankName: "GTBank",
    accountNumber: "****4521",
    requestedAt: "2026-06-28",
    status: "completed",
  },
];
