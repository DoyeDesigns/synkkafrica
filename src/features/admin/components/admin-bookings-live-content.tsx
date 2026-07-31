"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";

import { adminListBookings } from "@/lib/api/admin";

const STATUS_TABS = [
  "awaiting_confirmation",
  "confirmed",
  "declined",
  "completed",
  "cancelled",
] as const;
type StatusTab = (typeof STATUS_TABS)[number];

const STATUS_LABEL: Record<StatusTab, string> = {
  awaiting_confirmation: "Awaiting",
  confirmed: "Confirmed",
  declined: "Declined",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function AdminBookingsLiveContent() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const [tab, setTab] = useState<StatusTab>("awaiting_confirmation");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-bookings", tab],
    queryFn: () => adminListBookings(token as string, tab),
    enabled: Boolean(token),
    refetchOnWindowFocus: false,
  });

  const bookings = data ?? [];

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-satoshi text-[#2F2F2F]">
          Bookings
        </h1>
        <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
          Oversight of vendor marketplace bookings.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setTab(s)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold font-satoshi transition-colors ${
              tab === s
                ? "bg-[#135391] text-white"
                : "border border-[#E5E5E5] bg-white text-[#676565] hover:bg-[#F5F5F5]"
            }`}
          >
            {STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm font-medium font-satoshi text-[#676565]">
          Loading…
        </p>
      ) : bookings.length === 0 ? (
        <p className="rounded-lg border border-[#EEEEEE] bg-[#FAFAFA] px-4 py-6 text-center text-sm font-medium font-satoshi text-[#676565]">
          No bookings in this state.
        </p>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="flex flex-col gap-2 rounded-xl border border-[#EEEEEE] bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-bold font-satoshi text-[#2F2F2F]">
                  {b.listingTitle}
                </p>
                <p className="mt-0.5 truncate text-xs font-medium font-satoshi text-[#676565]">
                  {b.bookingReference} · {b.productType} · {b.guestCount}{" "}
                  guest(s)
                  {b.guestFirstName ? ` · ${b.guestFirstName}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold font-satoshi ${
                    b.paymentSecured
                      ? "bg-[#E7F6EC] text-[#2E7D32]"
                      : "bg-[#FFF4E5] text-[#9A7200]"
                  }`}
                >
                  {b.paymentSecured ? "Paid" : "Unpaid"}
                </span>
                <span className="text-sm font-bold font-satoshi text-[#2F2F2F]">
                  {b.currency} {b.amount.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
