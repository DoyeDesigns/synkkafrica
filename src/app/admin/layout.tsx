import { AdminDashboardLayoutClient } from "@/features/admin/components/admin-dashboard-layout-client";
import { getAdminSession } from "@/features/admin/get-admin-session";
import { AuthProvider } from "@/providers/session-provider";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  // Admin content components read the access token via useSession(), so this
  // segment needs the client SessionProvider. QueryProvider is global.
  return (
    <AuthProvider>
      <AdminDashboardLayoutClient adminName={session?.user?.name}>
        {children}
      </AdminDashboardLayoutClient>
    </AuthProvider>
  );
}
