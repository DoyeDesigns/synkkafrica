import { VendorDashboardLayoutClient } from "@/features/vendor/components/vendor-dashboard-layout-client";
import { DEFAULT_VENDOR_VERIFICATION_STATUS } from "@/features/vendor/constants";
import { auth } from "@/auth";

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <VendorDashboardLayoutClient
      vendorName={session?.user?.name}
      verificationStatus={DEFAULT_VENDOR_VERIFICATION_STATUS}
    >
      {children}
    </VendorDashboardLayoutClient>
  );
}
