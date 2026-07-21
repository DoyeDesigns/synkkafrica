import { auth } from "@/auth";
import { VendorBookingsContent } from "@/features/vendor/components/vendor-bookings-content";

export default async function VendorBookingsPage() {
  const session = await auth();

  return <VendorBookingsContent vendorName={session?.user?.name} />;
}
