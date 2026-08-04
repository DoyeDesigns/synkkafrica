"use client";

import Link from "next/link";
import { ChevronDown, Plus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { VendorListingAvailabilityPanel } from "@/features/vendor/components/vendor-listing-availability-panel";
import { VendorListingCard } from "@/features/vendor/components/vendor-listing-card";
import type { VendorDashboardListing } from "@/features/vendor/data/vendor-dashboard";
import { VENDOR_LISTINGS_PAGE_ITEMS } from "@/features/vendor/data/vendor-listings";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

const CATEGORY_FILTERS = [
  "all",
  "vendor.dashboard.category.accommodations",
  "vendor.dashboard.category.carRentals",
  "vendor.dashboard.category.tours",
  "vendor.dashboard.category.toursExperiences",
] as const;

const STATUS_FILTERS = ["all", "live", "pending"] as const;

type CategoryFilter = (typeof CATEGORY_FILTERS)[number];
type StatusFilter = (typeof STATUS_FILTERS)[number];

const STATUS_LABEL_KEYS: Record<Exclude<StatusFilter, "all">, TranslationKey> = {
  live: "vendor.listings.filter.status.live",
  pending: "vendor.listings.filter.status.pending",
};

function FilterPill<T extends string>({
  value,
  options,
  onChange,
  getLabel,
  ariaLabel,
}: {
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
  getLabel: (value: T) => string;
  ariaLabel: string;
}) {
  return (
    <label className="relative min-w-0 flex-1 sm:flex-none">
      <span className="sr-only">{ariaLabel}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="h-11 w-full min-w-[120px] appearance-none rounded-[25px] border border-[#D0D0D0] bg-[#A2A2A2]/10 px-4 pr-9 text-sm font-medium font-satoshi text-foreground outline-none focus:border-[#D85A30] sm:w-auto"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {getLabel(option)}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground" />
    </label>
  );
}

function matchesCategoryFilter(
  listing: VendorDashboardListing,
  categoryFilter: CategoryFilter,
) {
  if (categoryFilter === "all") {
    return true;
  }

  return listing.categoryKey === categoryFilter;
}

function matchesStatusFilter(
  listing: VendorDashboardListing,
  statusFilter: StatusFilter,
) {
  if (statusFilter === "all") {
    return true;
  }

  return listing.status === statusFilter;
}

type VendorListingsContentProps = {
  vendorName?: string | null;
};

export function VendorListingsContent({
  vendorName = "Alex Autos",
}: VendorListingsContentProps) {
  const t = useTranslation();
  const searchParams = useSearchParams();
  const displayName = vendorName?.trim() || "Alex Autos";
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const highlightedListingId = searchParams.get("listing");

  const filteredListings = useMemo(
    () =>
      VENDOR_LISTINGS_PAGE_ITEMS.filter(
        (listing) =>
          matchesCategoryFilter(listing, categoryFilter) &&
          matchesStatusFilter(listing, statusFilter),
      ),
    [categoryFilter, statusFilter],
  );

  useEffect(() => {
    if (!highlightedListingId) {
      return;
    }

    const target = document.getElementById(`listing-${highlightedListingId}`);

    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightedListingId, filteredListings.length]);

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold font-satoshi text-[#2F2F2F]">
          {t("vendor.dashboard.welcomeBack")}{" "}
          <span className="font-bold text-[#D85A30]">{displayName}</span>
        </h2>

        <Link
          href="/vendor/add-listing"
          className="inline-flex h-11 w-45.5 items-center justify-center gap-2 rounded-[5px] bg-[#D85A30] px-5 py-2.5 text-sm font-bold font-satoshi text-white transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" strokeWidth={3} />
          {t("vendor.dashboard.addListing")}
        </Link>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="order-2 xl:order-1">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-bold font-satoshi text-[#2F2F2F]">
              {t("vendor.dashboard.yourListings")}{" "}
              <span className="text-[#D85A30]">({filteredListings.length})</span>
            </h3>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
              <FilterPill
                value={categoryFilter}
                options={CATEGORY_FILTERS}
                onChange={setCategoryFilter}
                getLabel={(value) =>
                  value === "all"
                    ? t("vendor.listings.filter.allCategories")
                    : t(value)
                }
                ariaLabel={t("filters.category")}
              />
              <FilterPill
                value={statusFilter}
                options={STATUS_FILTERS}
                onChange={setStatusFilter}
                getLabel={(value) =>
                  value === "all"
                    ? t("vendor.listings.filter.allStatuses")
                    : t(STATUS_LABEL_KEYS[value])
                }
                ariaLabel={t("vendor.listings.filter.statusLabel")}
              />
            </div>
          </div>

          <div className="space-y-4 rounded-[5px] bg-white p-4">
            {filteredListings.length > 0 ? (
              filteredListings.map((listing) => (
                <VendorListingCard
                  key={listing.id}
                  listing={listing}
                  variant="listings"
                  highlighted={listing.id === highlightedListingId}
                />
              ))
            ) : (
              <div className="rounded-[5px] border border-[#EEEEEE] bg-[#F5F5F5] p-8 text-center">
                <p className="text-sm font-medium font-satoshi text-[#676565]">
                  {t("vendor.listings.filter.empty")}
                </p>
              </div>
            )}
          </div>
        </section>

        <aside className="order-1 xl:order-2 xl:sticky xl:top-0 xl:self-start">
          <h3 className="mb-4 font-bold font-satoshi text-[#2F2F2F]">
            {t("vendor.listings.bookingAvailability")}
          </h3>

          <VendorListingAvailabilityPanel />
        </aside>
      </div>
    </>
  );
}
