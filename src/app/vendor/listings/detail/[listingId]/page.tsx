import { Suspense } from "react";

import { auth } from "@/auth";
import { VendorListingDetailContent } from "@/features/vendor/components/vendor-listing-detail-content";

type VendorListingDetailPageProps = {
  params: Promise<{ listingId: string }>;
};

export default async function VendorListingDetailPage({
  params,
}: VendorListingDetailPageProps) {
  await auth();
  const { listingId } = await params;

  return (
    <Suspense fallback={null}>
      <VendorListingDetailContent listingId={listingId} />
    </Suspense>
  );
}
