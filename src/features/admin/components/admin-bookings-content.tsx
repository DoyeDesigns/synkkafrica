"use client";

import { useMemo, useState } from "react";

import {
  ADMIN_BOOKINGS,
  ADMIN_VENDORS_FOR_REASSIGN,
  type AdminBooking,
  type AdminBookingStatus,
} from "@/features/admin/data/admin-bookings";
import { useFormatPrice } from "@/hooks/use-format-price";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

const STATUS_LABEL_KEYS: Record<AdminBookingStatus, TranslationKey> = {
  confirmed: "admin.bookings.status.confirmed",
  awaiting_confirmation: "admin.bookings.status.awaiting",
  cancelled: "admin.bookings.status.cancelled",
  completed: "admin.bookings.status.completed",
};

export function AdminBookingsContent() {
  const t = useTranslation();
  const formatPrice = useFormatPrice();
  const [bookings, setBookings] = useState(ADMIN_BOOKINGS);
  const [statusFilter, setStatusFilter] = useState<AdminBookingStatus | "all">(
    "all",
  );

  const filtered = useMemo(
    () =>
      statusFilter === "all"
        ? bookings
        : bookings.filter((b) => b.status === statusFilter),
    [bookings, statusFilter],
  );

  const updateBooking = (id: string, patch: Partial<AdminBooking>) => {
    setBookings((current) =>
      current.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    );
  };

  return (
    <>
      <h2 className="text-lg font-bold font-satoshi text-[#2F2F2F]">
        {t("admin.bookings.title")}{" "}
        <span className="text-[#D85A30]">({filtered.length})</span>
      </h2>

      <div className="flex flex-wrap gap-2">
        {(["all", "awaiting_confirmation", "confirmed", "completed", "cancelled"] as const).map(
          (status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold font-satoshi ${
                statusFilter === status
                  ? "border-[#135391] bg-[#F0F6FC] text-[#135391]"
                  : "border-[#E5E5E5] bg-white text-[#676565]"
              }`}
            >
              {status === "all"
                ? t("admin.common.all")
                : t(STATUS_LABEL_KEYS[status])}
            </button>
          ),
        )}
      </div>

      <div className="space-y-4">
        {filtered.map((booking) => (
          <article
            key={booking.id}
            className="rounded-xl border border-[#EEEEEE] bg-white p-4 shadow-sm"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="font-bold font-satoshi text-[#2F2F2F]">
                  {booking.experienceTitle}
                </p>
                <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
                  {booking.guestFirstName} · {booking.guestEmail} ·{" "}
                  {booking.date} · {booking.guestCount}{" "}
                  {t("admin.bookings.guests")}
                </p>
                <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
                  {t("admin.bookings.vendor")}: {booking.vendorName} ·{" "}
                  {formatPrice(booking.currency, booking.amount)}
                </p>
                <span className="mt-2 inline-block rounded-full bg-[#E3F2FD] px-2.5 py-1 text-xs font-semibold text-[#1565C0]">
                  {t(STATUS_LABEL_KEYS[booking.status])}
                </span>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <select
                  value={booking.vendorId}
                  onChange={(e) => {
                    const vendor = ADMIN_VENDORS_FOR_REASSIGN.find(
                      (v) => v.id === e.target.value,
                    );
                    if (vendor) {
                      updateBooking(booking.id, {
                        vendorId: vendor.id,
                        vendorName: vendor.name,
                      });
                    }
                  }}
                  className="h-10 rounded-lg border border-[#E5E5E5] px-3 text-sm font-medium font-satoshi"
                >
                  {ADMIN_VENDORS_FOR_REASSIGN.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
                <a
                  href={`mailto:${booking.guestEmail}`}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-[#135391] px-4 text-sm font-bold font-satoshi text-[#135391]"
                >
                  {t("admin.bookings.contactCustomer")}
                </a>
                <button
                  type="button"
                  onClick={() =>
                    updateBooking(booking.id, { status: "cancelled" })
                  }
                  className="h-10 rounded-lg border border-[#C0392B] px-4 text-sm font-bold font-satoshi text-[#C0392B]"
                >
                  {t("admin.bookings.cancelRefund")}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
