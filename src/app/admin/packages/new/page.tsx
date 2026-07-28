import { AdminAddPackageContent } from "@/features/admin/components/admin-add-package-content";
import { getAdminSession } from "@/features/admin/get-admin-session";

export default async function AdminAddPackagePage() {
  await getAdminSession();

  return <AdminAddPackageContent />;
}
