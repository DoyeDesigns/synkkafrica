"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";

import { adminGetOverview } from "@/lib/api/admin";

type StatCard = {
  label: string;
  value: string;
  href?: string;
  accent?: boolean;
};

export function AdminDashboardLiveContent({
  adminName,
}: {
  adminName?: string | null;
}) {
  const { data: session } = useSession();
  const token = session?.accessToken;

  const { data, isLoading } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => adminGetOverview(token as string),
    enabled: Boolean(token),
    refetchOnWindowFocus: false,
  });

  const cards: StatCard[] = data
    ? [
        {
          label: "Vendors awaiting approval",
          value: String(data.pendingVendors),
          href: "/admin/vendors",
          accent: data.pendingVendors > 0,
        },
        {
          label: "Listings awaiting approval",
          value: String(data.pendingListings),
          href: "/admin/accommodations",
          accent: data.pendingListings > 0,
        },
        {
          label: "KYC docs to verify",
          value: String(data.pendingDocuments),
          href: "/admin/verifications",
          accent: data.pendingDocuments > 0,
        },
        {
          label: "Payouts to review",
          value: String(data.pendingPayouts),
          href: "/admin/payouts",
          accent: data.pendingPayouts > 0,
        },
        { label: "Active vendors", value: String(data.activeVendors) },
        { label: "Live listings", value: String(data.liveListings) },
        {
          label: "Bookings awaiting host",
          value: String(data.awaitingBookings),
          href: "/admin/bookings",
        },
        { label: "Total bookings", value: String(data.totalBookings) },
        { label: "Customers", value: String(data.customers) },
        {
          label: "Gross booking value",
          value: `${data.currency} ${data.grossBookingValue.toLocaleString()}`,
        },
      ]
    : [];

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-satoshi text-[#2F2F2F]">
          Welcome{adminName ? `, ${adminName}` : ""}
        </h1>
        <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
          Marketplace overview.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm font-medium font-satoshi text-[#676565]">
          Loading…
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((c) => {
            const inner = (
              <div
                className={`rounded-xl border bg-white p-5 ${
                  c.accent
                    ? "border-[#D85A30]/40 ring-1 ring-[#D85A30]/20"
                    : "border-[#EEEEEE]"
                }`}
              >
                <p className="text-xs font-semibold font-satoshi uppercase tracking-wide text-[#676565]">
                  {c.label}
                </p>
                <p
                  className={`mt-2 text-2xl font-bold font-satoshi ${
                    c.accent ? "text-[#D85A30]" : "text-[#2F2F2F]"
                  }`}
                >
                  {c.value}
                </p>
              </div>
            );
            return c.href ? (
              <Link key={c.label} href={c.href}>
                {inner}
              </Link>
            ) : (
              <div key={c.label}>{inner}</div>
            );
          })}
        </div>
      )}
    </section>
  );
}
