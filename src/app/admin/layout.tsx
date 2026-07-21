import { AdminDashboardLayoutClient } from "@/features/admin/components/admin-dashboard-layout-client";
import { getAdminSession } from "@/features/admin/get-admin-session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  return (
    <AdminDashboardLayoutClient adminName={session?.user?.name}>
      {children}
    </AdminDashboardLayoutClient>
  );
}
