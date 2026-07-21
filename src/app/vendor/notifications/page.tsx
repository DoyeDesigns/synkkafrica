import { auth } from "@/auth";
import { VendorNotificationsContent } from "@/features/vendor/components/vendor-notifications-content";

export default async function VendorNotificationsPage() {
  const session = await auth();

  return <VendorNotificationsContent vendorName={session?.user?.name} />;
}
