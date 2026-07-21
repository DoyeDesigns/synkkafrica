import { auth } from "@/auth";
import { VendorListingsContent } from "@/features/vendor/components/vendor-listings-content";

export default async function VendorListingsPage() {
  const session = await auth();

  return <VendorListingsContent vendorName={session?.user?.name} />;
}
