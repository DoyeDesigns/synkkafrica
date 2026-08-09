"use client";

import { Download } from "lucide-react";

import {
  ADMIN_POPULAR_EXPERIENCES,
  ADMIN_REPORT_METRICS,
  buildAdminReportCsv,
} from "@/features/admin/data/admin-reports";
import { useTranslation } from "@/hooks/use-translation";

export function AdminReportsContent() {
  const t = useTranslation();

  const downloadCsv = (filename: string, rows: string[][]) => {
    const csv = buildAdminReportCsv(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportRevenue = () => {
    downloadCsv("synkafrica-revenue-report.csv", [
      [t("admin.reports.metric"), t("admin.reports.value")],
      ...ADMIN_REPORT_METRICS.map((m) => [t(m.labelKey), m.value]),
    ]);
  };

  const exportBookings = () => {
    downloadCsv("synkafrica-bookings-report.csv", [
      [t("admin.reports.experience"), t("admin.reports.bookings")],
      ...ADMIN_POPULAR_EXPERIENCES.map((e) => [
        e.title,
        String(e.bookings),
      ]),
    ]);
  };

  return (
    <>
      <h2 className="text-lg font-bold font-satoshi text-[#2F2F2F]">
        {t("admin.reports.title")}
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {ADMIN_REPORT_METRICS.map((metric) => (
          <div
            key={metric.id}
            className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-bold font-satoshi text-[#676565]">
              {t(metric.labelKey)}
            </p>
            <p className="mt-2 text-xl font-bold font-inter text-[#D85A30]">
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm">
        <h3 className="text-base font-bold font-satoshi text-[#2F2F2F]">
          {t("admin.reports.popularExperiences")}
        </h3>
        <ul className="mt-4 divide-y divide-[#F0F0F0]">
          {ADMIN_POPULAR_EXPERIENCES.map((item) => (
            <li
              key={item.title}
              className="flex items-center justify-between py-3 text-sm font-medium font-satoshi"
            >
              <span className="text-[#2F2F2F]">{item.title}</span>
              <span className="text-[#676565]">
                {item.bookings} {t("admin.reports.bookings")}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={exportRevenue}
          className="inline-flex items-center gap-2 rounded-lg border border-[#D85A30] bg-white px-4 py-2.5 text-sm font-bold font-satoshi text-[#D85A30]"
        >
          <Download className="h-4 w-4" />
          {t("admin.reports.exportRevenue")}
        </button>
        <button
          type="button"
          onClick={exportBookings}
          className="inline-flex items-center gap-2 rounded-lg border border-[#135391] bg-white px-4 py-2.5 text-sm font-bold font-satoshi text-[#135391]"
        >
          <Download className="h-4 w-4" />
          {t("admin.reports.exportBookings")}
        </button>
      </div>
    </>
  );
}
