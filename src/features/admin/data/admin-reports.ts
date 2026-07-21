export type AdminReportMetric = {
  id: string;
  labelKey:
    | "admin.reports.totalRevenue"
    | "admin.reports.totalBookings"
    | "admin.reports.topExperience"
    | "admin.reports.activeVendors";
  value: string;
};

export const ADMIN_REPORT_METRICS: AdminReportMetric[] = [
  {
    id: "rep-1",
    labelKey: "admin.reports.totalRevenue",
    value: "NGN 48,750,000",
  },
  {
    id: "rep-2",
    labelKey: "admin.reports.totalBookings",
    value: "512",
  },
  {
    id: "rep-3",
    labelKey: "admin.reports.topExperience",
    value: "Lagos Lagoon Sunset Cruise",
  },
  {
    id: "rep-4",
    labelKey: "admin.reports.activeVendors",
    value: "34",
  },
];

export const ADMIN_POPULAR_EXPERIENCES = [
  { title: "Lagos Lagoon Sunset Cruise", bookings: 142 },
  { title: "Lekki Garden Suites", bookings: 89 },
  { title: "Tarkwa Bay Boat Tour", bookings: 56 },
];

export function buildAdminReportCsv(rows: string[][]) {
  return rows.map((row) => row.join(",")).join("\n");
}
