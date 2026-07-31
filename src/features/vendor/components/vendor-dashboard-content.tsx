"use client";

import {
  Calendar,
  ChevronDown,
  CircleEllipsis,
  List,
  Loader2,
  Plus,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";

import { VendorListingCard } from "@/features/vendor/components/vendor-listing-card";
import { VendorStatCard } from "@/features/vendor/components/vendor-stat-card";
import {
  VENDOR_DASHBOARD_PERIOD_OPTIONS,
  type VendorDashboardListing,
  type VendorDashboardPeriod,
} from "@/features/vendor/data/vendor-dashboard";
import { useFormatPrice } from "@/hooks/use-format-price";
import { useClickOutside } from "@/hooks/use-click-outside";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";
import {
  getVendorEarnings,
  listVendorBookings,
  listVendorListings,
  type VendorListingCategory,
  type VendorListingSummary,
} from "@/lib/api/vendor";

const PERIOD_LABEL_KEYS: Record<VendorDashboardPeriod, TranslationKey> = {
  day: "vendor.dashboard.period.day",
  week: "vendor.dashboard.period.week",
  month: "vendor.dashboard.period.month",
  sixMonths: "vendor.dashboard.period.sixMonths",
  year: "vendor.dashboard.period.year",
};

const CATEGORY_KEY: Record<
  VendorListingCategory,
  VendorDashboardListing["categoryKey"]
> = {
  cars: "vendor.dashboard.category.carRentals",
  accommodations: "vendor.dashboard.category.accommodations",
  experiences: "vendor.dashboard.category.toursExperiences",
};
const CATEGORY_LABEL: Record<VendorListingCategory, string> = {
  cars: "Car rentals",
  accommodations: "Accommodations",
  experiences: "Tours & experiences",
};
const CATEGORY_IMAGE: Record<VendorListingCategory, string> = {
  cars: "/hero/car-rentals.png",
  accommodations: "/hero/accommodations.png",
  experiences: "/destinations/lagos.png",
};

function toDashListing(l: VendorListingSummary): VendorDashboardListing {
  return {
    id: l.id,
    title: l.title,
    category: CATEGORY_LABEL[l.category],
    categoryKey: CATEGORY_KEY[l.category],
    rating: Math.round(l.ratingAvg),
    image: l.coverImageUrl || CATEGORY_IMAGE[l.category],
    status:
      l.status === "live" ? "live" : l.status === "paused" ? "paused" : "pending",
  };
}

type VendorDashboardContentProps = {
  vendorName?: string | null;
};

export function VendorDashboardContent({
  vendorName,
}: VendorDashboardContentProps) {
  const t = useTranslation();
  const formatPrice = useFormatPrice();
  const { data: session } = useSession();
  const token = session?.accessToken;
  const displayName = vendorName?.trim() || "your business";
  const [period, setPeriod] = useState<VendorDashboardPeriod>("month");
  const [periodOpen, setPeriodOpen] = useState(false);
  const periodDropdownRef = useRef<HTMLDivElement>(null);

  const { data: rawListings, isLoading } = useQuery({
    queryKey: ["vendor-listings"],
    queryFn: () => listVendorListings(token as string),
    enabled: Boolean(token),
    refetchOnWindowFocus: false,
  });
  const { data: bookings } = useQuery({
    queryKey: ["vendor-bookings"],
    queryFn: () => listVendorBookings(token as string),
    enabled: Boolean(token),
    refetchOnWindowFocus: false,
  });
  const { data: earnings } = useQuery({
    queryKey: ["vendor-earnings"],
    queryFn: () => getVendorEarnings(token as string),
    enabled: Boolean(token),
    refetchOnWindowFocus: false,
  });

  const listings = useMemo(
    () => (rawListings ?? []).map(toDashListing),
    [rawListings],
  );

  const liveListings = (rawListings ?? []).filter(
    (l) => l.status === "live",
  ).length;
  const pendingApproval = (rawListings ?? []).filter(
    (l) => l.status === "pending",
  ).length;
  const newBookings = (bookings ?? []).filter(
    (b) => b.status === "awaiting_confirmation",
  ).length;
  const currency = earnings?.currency ?? "NGN";
  const lifetimeEarnings = earnings?.lifetimeEarnings ?? 0;

  useClickOutside(periodDropdownRef, () => setPeriodOpen(false), periodOpen);

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold font-satoshi text-[#2F2F2F]">
          {t("vendor.dashboard.welcomeBack")}{" "}
          <span className="font-bold text-[#D85A30]">{displayName}</span>
        </h2>

        <Link
          href="/vendor/listings/new"
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
          value={String(liveListings)}
        />
        <VendorStatCard
          icon={Calendar}
          labelKey="vendor.dashboard.stats.newBookings"
          value={String(newBookings)}
          href="/vendor/bookings"
          linkKey="vendor.dashboard.goToBookings"
        />
        <VendorStatCard
          icon={Wallet}
          labelKey="vendor.dashboard.stats.earnings"
          value={formatPrice(currency, lifetimeEarnings)}
        />
        <VendorStatCard
          icon={CircleEllipsis}
          labelKey="vendor.dashboard.stats.pendingApproval"
          value={String(pendingApproval)}
        />
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="text-lg font-bold font-satoshi text-[#2F2F2F]">
            {t("vendor.dashboard.yourListings")}{" "}
            <span className="font-bold text-[#D85A30]">({listings.length})</span>
          </h3>
          <Link
            href="/vendor/listings"
            className="font-semibold font-satoshi text-[#D85A30] transition-opacity hover:opacity-80"
          >
            {t("vendor.dashboard.seeAll")}
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 bg-white rounded-[5px] p-5">
          {isLoading ? (
            <div className="col-span-full flex items-center justify-center gap-2 p-8 text-sm font-medium font-satoshi text-[#676565]">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : listings.length > 0 ? (
            listings.map((listing) => (
              <VendorListingCard key={listing.id} listing={listing} />
            ))
          ) : (
            <div className="col-span-full rounded-[5px] border border-[#EEEEEE] bg-[#F5F5F5] p-8 text-center">
              <p className="text-sm font-medium font-satoshi text-[#676565]">
                {t("vendor.listings.filter.empty")}
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
