import { VendorDashboardContent } from "@/features/vendor/components/vendor-dashboard-content";
import { auth } from "@/auth";

export default async function VendorDashboardPage() {
  const session = await auth();

  return <VendorDashboardContent vendorName={session?.user?.name} />;
}
