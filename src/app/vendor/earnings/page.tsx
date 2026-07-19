import { VendorEarningsContent } from "@/features/vendor/components/vendor-earnings-content";
import { auth } from "@/auth";

export default async function VendorEarningsPage() {
  const session = await auth();

  return <VendorEarningsContent vendorName={session?.user?.name} />;
}
