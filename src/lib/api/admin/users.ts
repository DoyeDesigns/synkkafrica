import { apiFetch } from "@/lib/api/backend";

// POST /admin/users/:id/disable
export async function disableAdminUser(
  token: string,
  id: string,
): Promise<unknown> {
  return apiFetch<unknown>(`/admin/users/${id}/disable`, {
    method: "POST",
    token,
  });
}

// POST /admin/users/:id/enable
export async function enableAdminUser(
  token: string,
  id: string,
): Promise<unknown> {
  return apiFetch<unknown>(`/admin/users/${id}/enable`, {
    method: "POST",
    token,
  });
}
