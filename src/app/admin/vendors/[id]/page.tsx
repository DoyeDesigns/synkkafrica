import { Suspense } from "react";

import { AdminVendorDetailLiveContent } from "@/features/admin/components/admin-vendor-detail-live-content";

type AdminVendorDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminVendorDetailPage({
  params,
}: AdminVendorDetailPageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={null}>
      <AdminVendorDetailLiveContent vendorId={id} />
    </Suspense>
  );
}
