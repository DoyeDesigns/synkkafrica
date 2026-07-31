import { auth } from "@/auth";
import { VendorAddListingContent } from "@/features/vendor/components/vendor-add-listing-content";

export default async function VendorEditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await auth();
  const { id } = await params;

  return <VendorAddListingContent editListingId={id} />;
}
