import { auth } from "@/auth";
import { VendorBusinessProfileContent } from "@/features/vendor/components/vendor-business-profile-content";

export default async function VendorBusinessProfilePage() {
  const session = await auth();

  return (
    <VendorBusinessProfileContent
      vendorName={session?.user?.name}
      vendorEmail={session?.user?.email}
    />
  );
}
