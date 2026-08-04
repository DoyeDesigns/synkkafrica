"use client";

import { Calendar, ChevronDown, CircleEllipsis, List, Plus, Wallet } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";

import { VendorListingCard } from "@/features/vendor/components/vendor-listing-card";
import { VendorStatCard } from "@/features/vendor/components/vendor-stat-card";
import {
  VENDOR_DASHBOARD_LISTINGS,
  VENDOR_DASHBOARD_PERIOD_OPTIONS,
  VENDOR_DASHBOARD_STATS,
  type VendorDashboardPeriod,
} from "@/features/vendor/data/vendor-dashboard";
import { useFormatPrice } from "@/hooks/use-format-price";
import { useClickOutside } from "@/hooks/use-click-outside";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

const PERIOD_LABEL_KEYS: Record<VendorDashboardPeriod, TranslationKey> = {
  day: "vendor.dashboard.period.day",
  week: "vendor.dashboard.period.week",
  month: "vendor.dashboard.period.month",
  sixMonths: "vendor.dashboard.period.sixMonths",
  year: "vendor.dashboard.period.year",
};

type VendorDashboardContentProps = {
  vendorName?: string | null;
};

export function VendorDashboardContent({
  vendorName = "Alex Autos",
}: VendorDashboardContentProps) {
  const t = useTranslation();
  const formatPrice = useFormatPrice();
  const displayName = vendorName?.trim() || "Alex Autos";
  const [period, setPeriod] = useState<VendorDashboardPeriod>("month");
  const [periodOpen, setPeriodOpen] = useState(false);
  const periodDropdownRef = useRef<HTMLDivElement>(null);
  const stats = VENDOR_DASHBOARD_STATS;

  useClickOutside(periodDropdownRef, () => setPeriodOpen(false), periodOpen);

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold font-satoshi text-[#2F2F2F]">
          {t("vendor.dashboard.welcomeBack")}{" "}
          <span className="font-bold text-[#D85A30]">{displayName}</span>
        </h2>

        <Link
          href="/vendor/add-listing"
          className="inline-flex items-center justify-center gap-2 w-45.5 h-11 rounded-[5px] bg-[#D85A30] px-5 py-2.5 text-sm font-bold font-satoshi text-white transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" strokeWidth={3} />
          {t("vendor.dashboard.addListing")}
        </Link>
      </div>

      <div ref={periodDropdownRef} className="relative w-full sm:max-w-xs">
        <button
          type="button"
          aria-label={t("vendor.dashboard.period.label")}
          aria-expanded={periodOpen}
          aria-haspopup="listbox"
          onClick={() => setPeriodOpen((open) => !open)}
          className="flex h-11 w-full items-center justify-between rounded-full border border-[#E5E5E5] bg-white px-4 text-sm font-semibold font-satoshi text-[#2F2F2F] outline-none transition-colors hover:border-[#D85A30] focus:border-[#D85A30]"
        >
          <span>{t(PERIOD_LABEL_KEYS[period])}</span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-[#676565] transition-transform ${periodOpen ? "rotate-180" : ""}`}
          />
        </button>

        {periodOpen ? (
          <ul
            role="listbox"
            aria-label={t("vendor.dashboard.period.label")}
            className="absolute left-0 top-[calc(100%+0.5rem)] z-50 w-full overflow-hidden rounded-xl border border-[#E5E5E5] bg-white py-1 shadow-lg"
          >
            {VENDOR_DASHBOARD_PERIOD_OPTIONS.map((option) => {
              const isSelected = option === period;

              return (
                <li key={option} role="presentation" className="w-full">
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      setPeriod(option);
                      setPeriodOpen(false);
                    }}
                    className={`block w-full px-4 py-2.5 text-left text-sm font-semibold font-satoshi transition-colors ${
                      isSelected
                        ? "bg-[#FFF1EB] text-[#D85A30]"
                        : "text-[#2F2F2F] hover:bg-[#FAFAFA]"
                    }`}
                  >
                    {t(PERIOD_LABEL_KEYS[option])}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <VendorStatCard
          icon={List}
          labelKey="vendor.dashboard.stats.liveListings"
          value={String(stats.liveListings)}
        />
        <VendorStatCard
          icon={Calendar}
          labelKey="vendor.dashboard.stats.newBookings"
          value={String(stats.newBookings[period])}
          href="/vendor/bookings"
          linkKey="vendor.dashboard.goToBookings"
        />
        <VendorStatCard
          icon={Wallet}
          labelKey="vendor.dashboard.stats.earnings"
          value={formatPrice(
            stats.earningsCurrency,
            stats.earnings[period],
          )}
        />
        <VendorStatCard
          icon={CircleEllipsis}
          labelKey="vendor.dashboard.stats.pendingApproval"
          value={String(stats.pendingApproval)}
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
