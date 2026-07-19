import { VendorDashboardLayoutClient } from "@/features/vendor/components/vendor-dashboard-layout-client";
import { auth } from "@/auth";

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <VendorDashboardLayoutClient vendorName={session?.user?.name}>
      {children}
    </VendorDashboardLayoutClient>
  );
}
