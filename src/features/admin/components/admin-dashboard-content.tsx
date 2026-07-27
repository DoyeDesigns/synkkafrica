"use client";

import { AlertTriangle, Building2, ChevronDown, Sparkles, Users, Wallet } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";

import {
  ADMIN_DASHBOARD_ALERTS,
  ADMIN_DASHBOARD_METRICS,
  ADMIN_PERIOD_OPTIONS,
  type AdminPeriod,
} from "@/features/admin/data/admin-dashboard";
import { VendorStatCard } from "@/features/vendor/components/vendor-stat-card";
import { useFormatPrice } from "@/hooks/use-format-price";
import { useClickOutside } from "@/hooks/use-click-outside";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

const PERIOD_LABEL_KEYS: Record<AdminPeriod, TranslationKey> = {
  today: "admin.dashboard.period.today",
  week: "admin.dashboard.period.week",
  month: "admin.dashboard.period.month",
  sixMonths: "admin.dashboard.period.sixMonths",
  year: "admin.dashboard.period.year",
  all: "admin.dashboard.period.all",
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
  const [periodOpen, setPeriodOpen] = useState(false);
  const periodDropdownRef = useRef<HTMLDivElement>(null);
  const metrics = ADMIN_DASHBOARD_METRICS;

  useClickOutside(periodDropdownRef, () => setPeriodOpen(false), periodOpen);

  return (
    <>
      <h2 className="text-xl font-medium font-satoshi text-[#2F2F2F]">
        {t("admin.dashboard.welcome")}{" "}
        <span className="font-bold text-[#D85A30]">{displayName}</span>
      </h2>

      <div ref={periodDropdownRef} className="relative w-full">
        <button
          type="button"
          aria-label={t("admin.dashboard.period.label")}
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
            aria-label={t("admin.dashboard.period.label")}
            className="absolute left-0 top-[calc(100%+0.5rem)] z-50 w-full overflow-hidden rounded-xl border border-[#E5E5E5] bg-white py-1 shadow-lg"
          >
            {ADMIN_PERIOD_OPTIONS.map((option) => {
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
          icon={Users}
          labelKey="admin.dashboard.users"
          value={String(metrics.users[period])}
          href="/admin/users"
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
                className={`block rounded-lg border px-4 py-3 text-sm font-medium font-satoshi underline underline-offset-2 transition-opacity hover:opacity-90 ${ALERT_STYLES[alert.severity]}`}
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
