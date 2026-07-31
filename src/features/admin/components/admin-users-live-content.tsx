"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";

import { adminListCustomers } from "@/lib/api/admin";

export function AdminUsersLiveContent() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const [query, setQuery] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: () => adminListCustomers(token as string),
    enabled: Boolean(token),
    refetchOnWindowFocus: false,
  });

  const customers = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = data ?? [];
    if (!q) return rows;
    return rows.filter(
      (c) =>
        c.email.toLowerCase().includes(q) ||
        `${c.firstName ?? ""} ${c.lastName ?? ""}`.toLowerCase().includes(q),
    );
  }, [data, query]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-satoshi text-[#2F2F2F]">
          Customers
        </h1>
        <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
          Registered customer accounts.
        </p>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name or email"
        className="h-11 w-full max-w-sm rounded-lg border border-[#E5E5E5] px-3 text-sm font-satoshi outline-none focus:border-[#135391]"
      />

      {isLoading ? (
        <p className="text-sm font-medium font-satoshi text-[#676565]">
          Loading…
        </p>
      ) : customers.length === 0 ? (
        <p className="rounded-lg border border-[#EEEEEE] bg-[#FAFAFA] px-4 py-6 text-center text-sm font-medium font-satoshi text-[#676565]">
          No customers found.
        </p>
      ) : (
        <div className="space-y-3">
          {customers.map((c) => (
            <div
              key={c.id}
              className="flex flex-col gap-2 rounded-xl border border-[#EEEEEE] bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-bold font-satoshi text-[#2F2F2F]">
                  {[c.firstName, c.lastName].filter(Boolean).join(" ") ||
                    "—"}
                </p>
                <p className="mt-0.5 truncate text-xs font-medium font-satoshi text-[#676565]">
                  {c.email}
                  {c.phoneNumber ? ` · ${c.phoneNumber}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {c.deleted ? (
                  <span className="rounded-full bg-[#FDEBEB] px-3 py-1 text-xs font-semibold font-satoshi text-[#C0392B]">
                    Deleted
                  </span>
                ) : c.emailVerified ? (
                  <span className="rounded-full bg-[#E7F6EC] px-3 py-1 text-xs font-semibold font-satoshi text-[#2E7D32]">
                    Verified
                  </span>
                ) : (
                  <span className="rounded-full bg-[#FFF4E5] px-3 py-1 text-xs font-semibold font-satoshi text-[#9A7200]">
                    Unverified
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
