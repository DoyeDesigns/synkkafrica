import { auth } from "@/auth";
import { VendorAddListingContent } from "@/features/vendor/components/vendor-add-listing-content";

export default async function VendorAddListingPage() {
  await auth();

  return <VendorAddListingContent />;
}
