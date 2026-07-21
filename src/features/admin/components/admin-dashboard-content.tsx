"use client";

import { AlertTriangle, Building2, Calendar, Sparkles, Wallet } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import {
  ADMIN_DASHBOARD_ALERTS,
  ADMIN_DASHBOARD_METRICS,
  ADMIN_PERIOD_OPTIONS,
  type AdminPeriod,
} from "@/features/admin/data/admin-dashboard";
import { VendorStatCard } from "@/features/vendor/components/vendor-stat-card";
import { useFormatPrice } from "@/hooks/use-format-price";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

const PERIOD_LABEL_KEYS: Record<AdminPeriod, TranslationKey> = {
  today: "admin.dashboard.period.today",
  week: "admin.dashboard.period.week",
  month: "admin.dashboard.period.month",
};

const ALERT_STYLES = {
  info: "border-[#E3F2FD] bg-[#F0F6FC] text-[#1565C0]",
  warning: "border-[#FFF3E0] bg-[#FFF9F0] text-[#E65100]",
  critical: "border-[#FDEBEB] bg-[#FFF5F5] text-[#C0392B]",
};

type AdminDashboardContentProps = {
  adminName?: string | null;
};

export function AdminDashboardContent({
  adminName = "SynKKafrica Admin",
}: AdminDashboardContentProps) {
  const t = useTranslation();
  const formatPrice = useFormatPrice();
  const displayName = adminName?.trim() || "SynKKafrica Admin";
  const [period, setPeriod] = useState<AdminPeriod>("today");
  const metrics = ADMIN_DASHBOARD_METRICS;

  return (
    <>
      <h2 className="text-xl font-medium font-satoshi text-[#2F2F2F]">
        {t("admin.dashboard.welcome")}{" "}
        <span className="font-bold text-[#D85A30]">{displayName}</span>
      </h2>

      <div
        className="grid grid-cols-3 gap-2 sm:w-fit"
        role="group"
        aria-label={t("admin.dashboard.period.label")}
      >
        {ADMIN_PERIOD_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setPeriod(option)}
            className={`rounded-lg border px-4 py-2 text-xs font-semibold font-satoshi transition-colors ${
              period === option
                ? "border-[#D85A30] bg-[#FFF1EB] text-[#D85A30]"
                : "border-[#E5E5E5] bg-white text-[#676565]"
            }`}
          >
            {t(PERIOD_LABEL_KEYS[option])}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <VendorStatCard
          icon={Calendar}
          labelKey="admin.dashboard.bookings"
          value={String(metrics.bookings[period])}
          href="/admin/bookings"
          linkKey="admin.dashboard.viewAll"
        />
        <VendorStatCard
          icon={Wallet}
          labelKey="admin.dashboard.revenue"
          value={formatPrice(metrics.currency, metrics.revenue[period])}
        />
        <VendorStatCard
          icon={Sparkles}
          labelKey="admin.dashboard.activeExperiences"
          value={String(metrics.activeExperiences)}
          href="/admin/experiences"
          linkKey="admin.dashboard.manage"
        />
        <VendorStatCard
          icon={Building2}
          labelKey="admin.dashboard.activeVendors"
          value={String(metrics.activeVendors)}
          href="/admin/vendors"
          linkKey="admin.dashboard.manage"
        />
      </div>

      <section className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-[#E65100]" />
          <h3 className="text-base font-bold font-satoshi text-[#2F2F2F]">
            {t("admin.dashboard.alerts")}
          </h3>
        </div>
        <ul className="space-y-2">
          {ADMIN_DASHBOARD_ALERTS.map((alert) => (
            <li key={alert.id}>
              <Link
                href={alert.href}
                className={`block rounded-lg border px-4 py-3 text-sm font-medium font-satoshi transition-opacity hover:opacity-90 ${ALERT_STYLES[alert.severity]}`}
              >
                {t(alert.messageKey)}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
