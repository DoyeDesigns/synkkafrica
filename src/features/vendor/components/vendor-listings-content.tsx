"use client";

import Link from "next/link";
import { ChevronDown, Loader2, Plus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { VendorListingAvailabilityPanel } from "@/features/vendor/components/vendor-listing-availability-panel";
import { VendorListingCard } from "@/features/vendor/components/vendor-listing-card";
import { VendorDeleteListingModal } from "@/features/vendor/components/vendor-delete-listing-modal";
import type { VendorDashboardListing } from "@/features/vendor/data/vendor-dashboard";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";
import {
  deleteVendorListing,
  listVendorListings,
  setVendorListingStatus,
  type VendorListingCategory,
  type VendorListingSummary,
} from "@/lib/api/vendor";

const CATEGORY_FILTERS = [
  "all",
  "vendor.dashboard.category.accommodations",
  "vendor.dashboard.category.carRentals",
  "vendor.dashboard.category.toursExperiences",
] as const;

const STATUS_FILTERS = ["all", "live", "pending"] as const;

type CategoryFilter = (typeof CATEGORY_FILTERS)[number];
type StatusFilter = (typeof STATUS_FILTERS)[number];

const STATUS_LABEL_KEYS: Record<Exclude<StatusFilter, "all">, TranslationKey> = {
  live: "vendor.listings.filter.status.live",
  pending: "vendor.listings.filter.status.pending",
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

// The card renders three statuses; map the backend's five onto them.
function toDashStatus(
  status: VendorListingSummary["status"],
): VendorDashboardListing["status"] {
  if (status === "live") return "live";
  if (status === "paused") return "paused";
  return "pending";
}

function toDashListing(l: VendorListingSummary): VendorDashboardListing {
  return {
    id: l.id,
    title: l.title,
    category: CATEGORY_LABEL[l.category],
    categoryKey: CATEGORY_KEY[l.category],
    rating: Math.round(l.ratingAvg),
    image: l.coverImageUrl || CATEGORY_IMAGE[l.category],
    status: toDashStatus(l.status),
  };
}

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

type VendorListingsContentProps = {
  vendorName?: string | null;
};

export function VendorListingsContent({
  vendorName,
}: VendorListingsContentProps) {
  const t = useTranslation();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const token = session?.accessToken;
  const queryClient = useQueryClient();

  const displayName = vendorName?.trim() || "your business";
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [deleteTarget, setDeleteTarget] =
    useState<VendorDashboardListing | null>(null);
  const highlightedListingId = searchParams.get("listing");

  const { data: rawListings, isLoading } = useQuery({
    queryKey: ["vendor-listings"],
    queryFn: () => listVendorListings(token as string),
    enabled: Boolean(token),
    refetchOnWindowFocus: false,
  });

  const listings = useMemo(
    () => (rawListings ?? []).map(toDashListing),
    [rawListings],
  );

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["vendor-listings"] });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "live" | "paused" }) =>
      setVendorListingStatus(token as string, id, status),
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteVendorListing(token as string, id),
    onSuccess: () => {
      setDeleteTarget(null);
      void invalidate();
    },
  });

  const handlePauseToggle = (id: string) => {
    const current = listings.find((l) => l.id === id);
    if (!current || current.status === "pending") return;
    statusMutation.mutate({
      id,
      status: current.status === "live" ? "paused" : "live",
    });
  };

  const filteredListings = useMemo(
    () =>
      listings.filter(
        (listing) =>
          (categoryFilter === "all" ||
            listing.categoryKey === categoryFilter) &&
          (statusFilter === "all" || listing.status === statusFilter),
      ),
    [listings, categoryFilter, statusFilter],
  );

  useEffect(() => {
    if (!highlightedListingId) return;
    const target = document.getElementById(`listing-${highlightedListingId}`);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightedListingId, filteredListings.length]);

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold font-satoshi text-[#2F2F2F]">
          {t("vendor.dashboard.welcomeBack")}{" "}
          <span className="font-bold text-[#D85A30]">{displayName}</span>
        </h2>

        <Link
          href="/vendor/listings/new"
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
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 p-8 text-sm font-medium font-satoshi text-[#676565]">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </div>
            ) : filteredListings.length > 0 ? (
              filteredListings.map((listing) => (
                <VendorListingCard
                  key={listing.id}
                  listing={listing}
                  variant="listings"
                  highlighted={listing.id === highlightedListingId}
                  onPauseToggle={handlePauseToggle}
                  onDeleteRequest={(id) =>
                    setDeleteTarget(listings.find((l) => l.id === id) ?? null)
                  }
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

      <VendorDeleteListingModal
        listingTitle={deleteTarget?.title ?? ""}
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
        }}
      />
    </>
  );
}
