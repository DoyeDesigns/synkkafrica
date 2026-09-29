import { AdminDashboardContent } from "@/features/admin/components/admin-dashboard-content";
import { getAdminSession } from "@/features/admin/get-admin-session";

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  return <AdminDashboardContent adminName={session?.user?.name} />;
}
