import { VendorLayoutSwitcher } from "@/features/vendor/components/vendor-layout-switcher";
import { DEFAULT_VENDOR_VERIFICATION_STATUS } from "@/features/vendor/constants";
import { auth } from "@/auth";

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <VendorLayoutSwitcher
      vendorName={session?.user?.name}
      verificationStatus={DEFAULT_VENDOR_VERIFICATION_STATUS}
    >
      {children}
    </VendorLayoutSwitcher>
  );
}
