"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { ADMIN_VENDORS, type AdminVendor } from "@/features/admin/data/admin-vendors";
import { useFormatPrice } from "@/hooks/use-format-price";
import { useTranslation } from "@/hooks/use-translation";

export function AdminVendorsContent() {
  const t = useTranslation();
  const formatPrice = useFormatPrice();
  const [vendors, setVendors] = useState(ADMIN_VENDORS);

  const toggleEnabled = (id: string) => {
    setVendors((current) =>
      current.map((vendor) =>
        vendor.id === id ? { ...vendor, enabled: !vendor.enabled } : vendor,
      ),
    );
  };

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold font-satoshi text-[#2F2F2F]">
          {t("admin.vendors.title")}{" "}
          <span className="text-[#D85A30]">({vendors.length})</span>
        </h2>
        <button
          type="button"
          className="inline-flex h-11 items-center gap-2 rounded-[5px] bg-[#D85A30] px-5 text-sm font-bold font-satoshi text-white"
        >
          <Plus className="h-4 w-4" strokeWidth={3} />
          {t("admin.vendors.add")}
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#EEEEEE] bg-white shadow-sm">
        <table className="min-w-full text-left text-sm font-satoshi">
          <thead className="border-b border-[#F0F0F0] bg-[#FAFAFA] text-xs font-semibold uppercase text-[#676565]">
            <tr>
              <th className="px-4 py-3">{t("admin.vendors.name")}</th>
              <th className="px-4 py-3">{t("admin.vendors.experiences")}</th>
              <th className="px-4 py-3">{t("admin.vendors.earnings")}</th>
              <th className="px-4 py-3">{t("admin.vendors.rating")}</th>
              <th className="px-4 py-3">{t("admin.common.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F0F0]">
            {vendors.map((vendor) => (
              <VendorRow
                key={vendor.id}
                vendor={vendor}
                formatPrice={formatPrice}
                onToggle={() => toggleEnabled(vendor.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function VendorRow({
  vendor,
  formatPrice,
  onToggle,
}: {
  vendor: AdminVendor;
  formatPrice: (currency: string, amount: number) => string;
  onToggle: () => void;
}) {
  const t = useTranslation();

  return (
    <tr>
      <td className="px-4 py-4">
        <p className="font-bold text-[#2F2F2F]">{vendor.name}</p>
        <p className="text-xs text-[#676565]">{vendor.email}</p>
      </td>
      <td className="px-4 py-4">{vendor.experienceCount}</td>
      <td className="px-4 py-4">
        {formatPrice(vendor.currency, vendor.earnings)}
      </td>
      <td className="px-4 py-4">{vendor.rating}</td>
      <td className="px-4 py-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onToggle}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
              vendor.enabled
                ? "bg-[#E8F5E9] text-[#2E7D32]"
                : "bg-[#F5F5F5] text-[#676565]"
            }`}
          >
            {vendor.enabled ? t("admin.common.enabled") : t("admin.common.disabled")}
          </button>
          <button
            type="button"
            className="rounded-lg border border-[#135391] px-3 py-1.5 text-xs font-bold text-[#135391]"
          >
            {t("admin.common.edit")}
          </button>
        </div>
      </td>
    </tr>
  );
}
