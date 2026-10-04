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

import { VendorDeleteListingModal } from "@/features/vendor/components/vendor-delete-listing-modal";
import {
  VendorListingActionError,
  VendorListingCard,
} from "@/features/vendor/components/vendor-listing-card";
import { VendorStatCard } from "@/features/vendor/components/vendor-stat-card";
import {
  VENDOR_DASHBOARD_PERIOD_OPTIONS,
  type VendorDashboardListing,
  type VendorDashboardPeriod,
} from "@/features/vendor/data/vendor-dashboard";
import { useVendorListingMutations } from "@/features/vendor/hooks/use-vendor-listing-mutations";
import { toVendorDashListing } from "@/features/vendor/vendor-listing-mappers";
import { VENDOR_QUERY_KEYS } from "@/features/vendor/vendor-query-keys";
import { formatMoney } from "@/lib/format-money";
import { useClickOutside } from "@/hooks/use-click-outside";
import { useTranslation } from "@/hooks/use-translation";
import { LIVE_QUERY_OPTIONS, POLLING_QUERY_OPTIONS } from "@/lib/live-query-options";
import type { TranslationKey } from "@/lib/preferences/translations";
import {
  getVendorEarnings,
  listVendorBookings,
  listVendorListings,
} from "@/lib/api/vendor";

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
  vendorName,
}: VendorDashboardContentProps) {
  const t = useTranslation();
  // Vendor amounts are shown in the booking/listing currency, never FX-converted.
  const formatPrice = formatMoney;
  const { data: session } = useSession();
  const token = session?.accessToken;
  const displayName = vendorName?.trim() || "your business";
  const [period, setPeriod] = useState<VendorDashboardPeriod>("month");
  const [periodOpen, setPeriodOpen] = useState(false);
  const periodDropdownRef = useRef<HTMLDivElement>(null);
  const listingMutations = useVendorListingMutations();
  const [deleteTarget, setDeleteTarget] =
    useState<VendorDashboardListing | null>(null);

  const { data: rawListings, isLoading } = useQuery({
    queryKey: VENDOR_QUERY_KEYS.listings,
    queryFn: () => listVendorListings(token as string),
    enabled: Boolean(token),
    ...LIVE_QUERY_OPTIONS,
  });
  const { data: bookings } = useQuery({
    queryKey: VENDOR_QUERY_KEYS.bookings,
    queryFn: () => listVendorBookings(token as string),
    enabled: Boolean(token),
    ...POLLING_QUERY_OPTIONS,
  });
  const { data: earnings } = useQuery({
    queryKey: VENDOR_QUERY_KEYS.earnings,
    queryFn: () => getVendorEarnings(token as string),
    enabled: Boolean(token),
    ...LIVE_QUERY_OPTIONS,
  });

  const listings = useMemo(
    () => (rawListings ?? []).map(toVendorDashListing),
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

      <section className="min-w-0">
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

        <div className="grid min-w-0 gap-4 rounded-[5px] bg-white p-4 sm:p-5 lg:grid-cols-2">
          {listingMutations.error ? (
            <div className="col-span-full">
              <VendorListingActionError
                message={listingMutations.error}
                onDismiss={listingMutations.clearError}
              />
            </div>
          ) : null}
          {isLoading ? (
            <div className="col-span-full flex items-center justify-center gap-2 p-8 text-sm font-medium font-satoshi text-[#676565]">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : listings.length > 0 ? (
            listings.map((listing) => (
              <VendorListingCard
                key={listing.id}
                listing={listing}
                busy={listingMutations.isTogglePending(listing.id)}
                onPauseToggle={listingMutations.togglePause}
                onDeleteRequest={(id) =>
                  setDeleteTarget(listings.find((l) => l.id === id) ?? null)
                }
              />
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

      <VendorDeleteListingModal
        listingTitle={deleteTarget?.title ?? ""}
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          listingMutations.deleteListing(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </>
  );
}
