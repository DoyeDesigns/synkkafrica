"use client";

import { MoreVertical, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  filterAdminListings,
  type AdminListing,
  type AdminListingKind,
  type AdminListingStatus,
} from "@/features/admin/data/admin-listings";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

const STATUS_LABEL_KEYS: Record<AdminListingStatus, TranslationKey> = {
  active: "admin.listings.status.active",
  inactive: "admin.listings.status.inactive",
};

const STATUS_BADGE_STYLES: Record<AdminListingStatus, string> = {
  active: "bg-[#E8F5E9] text-[#2E7D32]",
  inactive: "bg-[#F5F5F5] text-[#676565]",
};

const SEARCH_KEYS: Record<AdminListingKind, TranslationKey> = {
  experiences: "admin.experiences.searchPlaceholder",
  cars: "admin.cars.searchPlaceholder",
  accommodations: "admin.accommodations.searchPlaceholder",
};

const NAME_KEYS: Record<AdminListingKind, TranslationKey> = {
  experiences: "admin.experiences.name",
  cars: "admin.cars.name",
  accommodations: "admin.accommodations.name",
};

const EMPTY_KEYS: Record<AdminListingKind, TranslationKey> = {
  experiences: "admin.experiences.empty",
  cars: "admin.cars.empty",
  accommodations: "admin.accommodations.empty",
};

const DISABLE_KEYS: Record<AdminListingKind, TranslationKey> = {
  experiences: "admin.experiences.actions.disable",
  cars: "admin.cars.actions.disable",
  accommodations: "admin.accommodations.actions.disable",
};

const ENABLE_KEYS: Record<AdminListingKind, TranslationKey> = {
  experiences: "admin.experiences.actions.enable",
  cars: "admin.cars.actions.enable",
  accommodations: "admin.accommodations.actions.enable",
};

const GO_TO_KEYS: Record<AdminListingKind, TranslationKey> = {
  experiences: "admin.experiences.actions.goTo",
  cars: "admin.cars.actions.goTo",
  accommodations: "admin.accommodations.actions.goTo",
};

const DELETE_KEYS: Record<AdminListingKind, TranslationKey> = {
  experiences: "admin.experiences.actions.delete",
  cars: "admin.cars.actions.delete",
  accommodations: "admin.accommodations.actions.delete",
};

type AdminListingsContentProps = {
  kind: AdminListingKind;
  initialListings: AdminListing[];
};

export function AdminListingsContent({ kind, initialListings }: AdminListingsContentProps) {
  const t = useTranslation();
  const [listings, setListings] = useState(initialListings);
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filteredListings = useMemo(
    () => filterAdminListings(listings, searchQuery),
    [listings, searchQuery],
  );

  const setListingStatus = (id: string, status: AdminListingStatus) => {
    setListings((current) =>
      current.map((listing) => (listing.id === id ? { ...listing, status } : listing)),
    );
    setOpenMenuId(null);
  };

  const deleteListing = (id: string) => {
    setListings((current) => current.filter((listing) => listing.id !== id));
    setOpenMenuId(null);
  };

  return (
    <>
      <div className="flex justify-end">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={t(SEARCH_KEYS[kind])}
            className="h-11 w-full rounded-full border border-[#E5E5E5] bg-white pl-11 pr-4 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none transition-colors focus:border-[#135391]"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#EEEEEE] bg-white shadow-sm">
        <table className="min-w-[1040px] w-full text-left text-sm font-satoshi">
          <thead className="border-b border-[#F0F0F0] bg-[#FAFAFA] text-xs font-semibold uppercase text-[#676565]">
            <tr>
              <th className="min-w-[180px] px-4 py-3">{t(NAME_KEYS[kind])}</th>
              <th className="min-w-[160px] px-4 py-3">{t("admin.listings.location")}</th>
              <th className="min-w-[140px] px-4 py-3">{t("admin.listings.vendor")}</th>
              <th className="min-w-[90px] px-4 py-3">{t("admin.listings.bookings")}</th>
              <th className="min-w-[120px] px-4 py-3">{t("admin.listings.ratings")}</th>
              <th className="min-w-[160px] whitespace-nowrap px-4 py-3">
                {t("admin.listings.activityStatus")}
              </th>
              <th className="w-12 px-4 py-3">
                <span className="sr-only">{t("admin.common.actions")}</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F0F0]">
            {filteredListings.length > 0 ? (
              filteredListings.map((listing) => (
                <ListingRow
                  key={listing.id}
                  kind={kind}
                  listing={listing}
                  isMenuOpen={openMenuId === listing.id}
                  onMenuToggle={() =>
                    setOpenMenuId((current) => (current === listing.id ? null : listing.id))
                  }
                  onMenuClose={() => setOpenMenuId(null)}
                  onDisable={() => setListingStatus(listing.id, "inactive")}
                  onEnable={() => setListingStatus(listing.id, "active")}
                  onDelete={() => deleteListing(listing.id)}
                />
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-sm font-medium text-[#676565]"
                >
                  {t(EMPTY_KEYS[kind])}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function ListingRow({
  kind,
  listing,
  isMenuOpen,
  onMenuToggle,
  onMenuClose,
  onDisable,
  onEnable,
  onDelete,
}: {
  kind: AdminListingKind;
  listing: AdminListing;
  isMenuOpen: boolean;
  onMenuToggle: () => void;
  onMenuClose: () => void;
  onDisable: () => void;
  onEnable: () => void;
  onDelete: () => void;
}) {
  const t = useTranslation();
  const menuRef = useRef<HTMLDivElement>(null);
  const isActive = listing.status === "active";

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        onMenuClose();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isMenuOpen, onMenuClose]);

  return (
    <tr>
      <td className="px-4 py-4">
        <p className="font-bold text-[#2F2F2F]">{listing.name}</p>
      </td>
      <td className="px-4 py-4 font-medium whitespace-nowrap text-[#676565]">
        {listing.location}
      </td>
      <td className="px-4 py-4 font-medium whitespace-nowrap text-[#2F2F2F]">
        {listing.vendorName}
      </td>
      <td className="px-4 py-4 font-medium text-[#2F2F2F]">{listing.bookings}</td>
      <td className="px-4 py-4 whitespace-nowrap">
        <span className="font-semibold text-[#D85A30]">{listing.rating}</span>
        <span className="text-[#676565]">
          {" "}
          ({listing.reviewCount} {t("admin.listings.reviews")})
        </span>
      </td>
      <td className="min-w-[160px] px-4 py-4">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${STATUS_BADGE_STYLES[listing.status]}`}
        >
          {t(STATUS_LABEL_KEYS[listing.status])}
        </span>
      </td>
      <td className="relative px-4 py-4">
        <div ref={menuRef} className="relative flex justify-end">
          <button
            type="button"
            onClick={onMenuToggle}
            aria-expanded={isMenuOpen}
            aria-haspopup="menu"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#676565] transition-colors hover:bg-[#F5F5F5]"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {isMenuOpen ? (
            <div className="absolute right-0 top-full z-20 mt-1 min-w-[180px] overflow-hidden rounded-lg border border-[#EEEEEE] bg-white py-1 shadow-lg">
              {isActive ? (
                <button
                  type="button"
                  onClick={onDisable}
                  className="block w-full px-4 py-2.5 text-left text-sm font-medium font-satoshi text-[#2F2F2F] transition-colors hover:bg-[#FAFAFA]"
                >
                  {t(DISABLE_KEYS[kind])}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onEnable}
                  className="block w-full px-4 py-2.5 text-left text-sm font-medium font-satoshi text-[#2F2F2F] transition-colors hover:bg-[#FAFAFA]"
                >
                  {t(ENABLE_KEYS[kind])}
                </button>
              )}
              <Link
                href={listing.publicUrl}
                onClick={onMenuClose}
                className="block px-4 py-2.5 text-sm font-medium font-satoshi text-[#2F2F2F] transition-colors hover:bg-[#FAFAFA]"
              >
                {t(GO_TO_KEYS[kind])}
              </Link>
              <button
                type="button"
                onClick={onDelete}
                className="block w-full px-4 py-2.5 text-left text-sm font-medium font-satoshi text-[#DD2222] transition-colors hover:bg-[#FFF5F5]"
              >
                {t(DELETE_KEYS[kind])}
              </button>
            </div>
          ) : null}
        </div>
      </td>
    </tr>
  );
}
