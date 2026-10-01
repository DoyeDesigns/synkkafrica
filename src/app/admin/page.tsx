import { AdminDashboardLiveContent } from "@/features/admin/components/admin-dashboard-live-content";
import { getAdminSession } from "@/features/admin/get-admin-session";

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  return <AdminDashboardLiveContent adminName={session?.user?.name} />;
}
