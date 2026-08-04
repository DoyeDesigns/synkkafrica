import { apiFetch } from "@/lib/api/backend";

export type AdminReportRangeQuery = {
  from: string;
  to: string;
  currency?: string;
};

// GET /admin/reports/overview
export async function getAdminReportsOverview(
  token: string,
  query: AdminReportRangeQuery,
): Promise<unknown> {
  return apiFetch<unknown>("/admin/reports/overview", { token, query });
}

// GET /admin/reports/daily
export async function getAdminReportsDaily(
  token: string,
  query: AdminReportRangeQuery,
): Promise<unknown> {
  return apiFetch<unknown>("/admin/reports/daily", { token, query });
}

// GET /admin/reports/by-provider
export async function getAdminReportsByProvider(
  token: string,
  query: Pick<AdminReportRangeQuery, "from" | "to">,
): Promise<unknown> {
  return apiFetch<unknown>("/admin/reports/by-provider", { token, query });
}

// GET /admin/reports/by-carrier
export async function getAdminReportsByCarrier(
  token: string,
  query: Pick<AdminReportRangeQuery, "from" | "to">,
): Promise<unknown> {
  return apiFetch<unknown>("/admin/reports/by-carrier", { token, query });
}

// GET /admin/reports/transactions.csv — returns CSV text.
export async function downloadAdminTransactionsCsv(
  token: string,
  query: Pick<AdminReportRangeQuery, "from" | "to">,
): Promise<string> {
  return apiFetch<string>("/admin/reports/transactions.csv", { token, query });
}
