"use client";

import { Calendar, CircleEllipsis, List, MoreHorizontal, Plus, Wallet } from "lucide-react";
import Link from "next/link";

import { VendorListingCard } from "@/features/vendor/components/vendor-listing-card";
import { VendorStatCard } from "@/features/vendor/components/vendor-stat-card";
import {
  VENDOR_DASHBOARD_LISTINGS,
  VENDOR_DASHBOARD_STATS,
} from "@/features/vendor/data/vendor-dashboard";
import { useFormatPrice } from "@/hooks/use-format-price";
import { useTranslation } from "@/hooks/use-translation";

type VendorDashboardContentProps = {
  vendorName?: string | null;
};

export function VendorDashboardContent({
  vendorName = "Alex Autos",
}: VendorDashboardContentProps) {
  const t = useTranslation();
  const formatPrice = useFormatPrice();
  const displayName = vendorName?.trim() || "Alex Autos";

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold font-satoshi text-[#2F2F2F]">
          {t("vendor.dashboard.welcomeBack")}{" "}
          <span className="font-bold text-[#D85A30]">{displayName}</span>
        </h2>

        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 w-45.5 h-11 rounded-[5px] bg-[#D85A30] px-5 py-2.5 text-sm font-bold font-satoshi text-white transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" strokeWidth={3} />
          {t("vendor.dashboard.addListing")}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <VendorStatCard
          icon={List}
          labelKey="vendor.dashboard.stats.liveListings"
          value={String(VENDOR_DASHBOARD_STATS.liveListings)}
        />
        <VendorStatCard
          icon={Calendar}
          labelKey="vendor.dashboard.stats.newBookings"
          value={String(VENDOR_DASHBOARD_STATS.newBookings)}
          href="/vendor/bookings"
          linkKey="vendor.dashboard.goToBookings"
        />
        <VendorStatCard
          icon={Wallet}
          labelKey="vendor.dashboard.stats.earnings"
          value={formatPrice(
            VENDOR_DASHBOARD_STATS.earningsCurrency,
            VENDOR_DASHBOARD_STATS.earnings,
          )}
        />
        <VendorStatCard
          icon={CircleEllipsis}
          labelKey="vendor.dashboard.stats.pendingApproval"
          value={String(VENDOR_DASHBOARD_STATS.pendingApproval)}
        />
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="text-lg font-bold font-satoshi text-[#2F2F2F]">
            {t("vendor.dashboard.yourListings")}{" "}
            <span className="font-bold text-[#D85A30]">
              ({VENDOR_DASHBOARD_LISTINGS.length})
            </span>
          </h3>
          <Link
            href="/vendor/listings"
            className="font-semibold font-satoshi text-[#D85A30] transition-opacity hover:opacity-80"
          >
            {t("vendor.dashboard.seeAll")}
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 bg-white rounded-[5px] p-5">
          {VENDOR_DASHBOARD_LISTINGS.map((listing) => (
            <VendorListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>
    </>
  );
}
