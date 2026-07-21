import { auth } from "@/auth";
import { VendorSupportContent } from "@/features/vendor/components/vendor-support-content";

export default async function VendorSupportPage() {
  const session = await auth();

  return (
    <VendorSupportContent
      vendorName={session?.user?.name}
      vendorEmail={session?.user?.email}
    />
  );
}
