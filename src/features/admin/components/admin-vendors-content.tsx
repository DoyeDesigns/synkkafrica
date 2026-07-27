"use client";

import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  ADMIN_VENDORS,
  filterAdminVendors,
  getAdminVendorStats,
  paginateAdminVendors,
  type AdminVendor,
  type AdminVendorStatus,
} from "@/features/admin/data/admin-vendors";
import { useFormatPrice } from "@/hooks/use-format-price";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

const STATUS_LABEL_KEYS: Record<AdminVendorStatus, TranslationKey> = {
  active: "admin.vendors.status.active",
  inactive: "admin.vendors.status.inactive",
};

const STATUS_BADGE_STYLES: Record<AdminVendorStatus, string> = {
  active: "bg-[#E8F5E9] text-[#2E7D32]",
  inactive: "bg-[#F5F5F5] text-[#676565]",
};

export function AdminVendorsContent() {
  const t = useTranslation();
  const formatPrice = useFormatPrice();
  const [vendors, setVendors] = useState(ADMIN_VENDORS);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredVendors = useMemo(
    () => filterAdminVendors(vendors, searchQuery),
    [searchQuery, vendors],
  );

  const stats = useMemo(
    () => getAdminVendorStats(filteredVendors),
    [filteredVendors],
  );

  const pagination = useMemo(
    () => paginateAdminVendors(filteredVendors, currentPage),
    [currentPage, filteredVendors],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    if (currentPage > pagination.totalPages) {
      setCurrentPage(pagination.totalPages);
    }
  }, [currentPage, pagination.totalPages]);

  const setVendorStatus = (id: string, status: AdminVendorStatus) => {
    setVendors((current) =>
      current.map((vendor) => (vendor.id === id ? { ...vendor, status } : vendor)),
    );
  };

  return (
    <>
      <h2 className="text-lg font-bold font-satoshi text-[#2F2F2F]">
        {t("admin.vendors.title")}
      </h2>

      <VendorStatsBar
        total={stats.total}
        active={stats.active}
        combinedRevenue={formatPrice(stats.currency, stats.combinedRevenue)}
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
      />

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]" />
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder={t("admin.vendors.searchPlaceholder")}
          className="h-11 w-full rounded-full border border-[#E5E5E5] bg-white pl-11 pr-4 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none transition-colors focus:border-[#135391]"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#EEEEEE] bg-white shadow-sm">
        <table className="min-w-[1200px] w-full text-left text-sm font-satoshi">
          <thead className="border-b border-[#F0F0F0] bg-[#FAFAFA] text-xs font-semibold uppercase text-[#676565]">
            <tr>
              <th className="min-w-[110px] px-4 py-3">{t("admin.vendors.vendorId")}</th>
              <th className="min-w-[140px] px-4 py-3">{t("admin.vendors.name")}</th>
              <th className="min-w-[180px] px-4 py-3">{t("admin.vendors.contactInfo")}</th>
              <th className="min-w-[130px] px-4 py-3">{t("admin.vendors.rating")}</th>
              <th className="min-w-[90px] px-4 py-3">{t("admin.vendors.listings")}</th>
              <th className="min-w-[110px] px-4 py-3">{t("admin.vendors.commission")}</th>
              <th className="min-w-[100px] px-4 py-3">{t("admin.vendors.status")}</th>
              <th className="min-w-[130px] px-4 py-3">{t("admin.vendors.revenue")}</th>
              <th className="min-w-[220px] px-4 py-3">{t("admin.common.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F0F0]">
            {pagination.items.length > 0 ? (
              pagination.items.map((vendor) => (
                <VendorRow
                  key={vendor.id}
                  vendor={vendor}
                  formatPrice={formatPrice}
                  onSetStatus={(status) => setVendorStatus(vendor.id, status)}
                />
              ))
            ) : (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-10 text-center text-sm font-medium text-[#676565]"
                >
                  {t("admin.vendors.empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 ? (
        <VendorPagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={setCurrentPage}
        />
      ) : null}
    </>
  );
}

function VendorStatsBar({
  total,
  active,
  combinedRevenue,
  currentPage,
  totalPages,
}: {
  total: number;
  active: number;
  combinedRevenue: string;
  currentPage: number;
  totalPages: number;
}) {
  const t = useTranslation();

  const items = [
    { label: t("admin.vendors.stats.found"), value: String(total) },
    { label: t("admin.vendors.stats.active"), value: String(active) },
    { label: t("admin.vendors.stats.combinedRevenue"), value: combinedRevenue },
    {
      label: t("admin.vendors.stats.page"),
      value: t("admin.vendors.stats.pageValue", {
        current: currentPage,
        total: totalPages,
      }),
    },
  ];

  return (
    <div className="grid grid-cols-2 overflow-hidden bg-[#0F2744] lg:grid-cols-4">
      {items.map((item, index) => (
        <div
          key={item.label}
          className={`px-5 py-4 ${index > 0 ? "border-[#1E3A5F] lg:border-l" : ""} ${
            index === 2 ? "border-[#1E3A5F] border-t lg:border-t-0" : ""
          } ${index === 3 ? "border-[#1E3A5F] border-t lg:border-t-0" : ""}`}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#9EB3CC]">
            {item.label}
          </p>
          <p className="mt-2 text-xl font-bold font-inter text-[#D4AF37]">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function VendorPagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const t = useTranslation();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm font-medium font-satoshi text-[#676565]">
        {t("admin.vendors.pagination.showing", {
          current: currentPage,
          total: totalPages,
        })}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="inline-flex items-center gap-1 rounded-lg border border-[#E5E5E5] bg-white px-3 py-2 text-xs font-bold font-satoshi text-[#2F2F2F] transition-colors hover:bg-[#FAFAFA] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
          {t("admin.vendors.pagination.previous")}
        </button>

        {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`min-w-9 rounded-lg px-3 py-2 text-xs font-bold font-satoshi transition-colors ${
              page === currentPage
                ? "bg-[#135391] text-white"
                : "border border-[#E5E5E5] bg-white text-[#2F2F2F] hover:bg-[#FAFAFA]"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="inline-flex items-center gap-1 rounded-lg border border-[#E5E5E5] bg-white px-3 py-2 text-xs font-bold font-satoshi text-[#2F2F2F] transition-colors hover:bg-[#FAFAFA] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t("admin.vendors.pagination.next")}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function VendorRow({
  vendor,
  formatPrice,
  onSetStatus,
}: {
  vendor: AdminVendor;
  formatPrice: (currency: string, amount: number) => string;
  onSetStatus: (status: AdminVendorStatus) => void;
}) {
  const t = useTranslation();
  const isEnabled = vendor.status === "active";

  return (
    <tr>
      <td className="px-4 py-4 font-medium whitespace-nowrap text-[#676565]">
        {vendor.accountId}
      </td>
      <td className="px-4 py-4">
        <p className="font-bold text-[#2F2F2F]">{vendor.name}</p>
      </td>
      <td className="px-4 py-4">
        <p className="font-medium whitespace-nowrap text-[#2F2F2F]">{vendor.phone}</p>
        <p className="mt-0.5 text-xs text-[#676565]">{vendor.email}</p>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <span className="font-semibold text-[#D85A30]">{vendor.rating}</span>
        <span className="text-[#676565]">
          {" "}
          ({vendor.reviewCount} {t("admin.vendors.reviews")})
        </span>
      </td>
      <td className="px-4 py-4 font-medium text-[#2F2F2F]">
        {vendor.listingsCount}
      </td>
      <td className="px-4 py-4 font-medium whitespace-nowrap text-[#2F2F2F]">
        {t("admin.vendors.commissionValue", { rate: vendor.commissionRate })}
      </td>
      <td className="px-4 py-4">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${STATUS_BADGE_STYLES[vendor.status]}`}
        >
          {t(STATUS_LABEL_KEYS[vendor.status])}
        </span>
      </td>
      <td className="px-4 py-4 font-semibold whitespace-nowrap text-[#2F2F2F]">
        {formatPrice(vendor.currency, vendor.revenue)}
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-nowrap items-center gap-2">
          <button
            type="button"
            onClick={() => onSetStatus("active")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold whitespace-nowrap ${
              isEnabled
                ? "bg-[#E8F5E9] text-[#2E7D32]"
                : "border border-[#E5E5E5] bg-white text-[#676565] hover:bg-[#FAFAFA]"
            }`}
          >
            {t("admin.common.enabled")}
          </button>
          <button
            type="button"
            onClick={() => onSetStatus("inactive")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold whitespace-nowrap ${
              !isEnabled
                ? "bg-[#F5F5F5] text-[#676565]"
                : "border border-[#E5E5E5] bg-white text-[#676565] hover:bg-[#FAFAFA]"
            }`}
          >
            {t("admin.common.disabled")}
          </button>
          <Link
            href={`/admin/vendors/${vendor.id}`}
            className="inline-flex rounded-lg border border-[#135391] px-3 py-1.5 text-xs font-bold whitespace-nowrap text-[#135391] transition-colors hover:bg-[#F0F6FC]"
          >
            {t("admin.vendors.details")}
          </Link>
        </div>
      </td>
    </tr>
  );
}
