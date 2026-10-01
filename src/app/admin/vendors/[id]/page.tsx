import { AdminVendorDetailLiveContent } from "@/features/admin/components/admin-vendor-detail-live-content";

type AdminVendorDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminVendorDetailPage({
  params,
}: AdminVendorDetailPageProps) {
  const { id } = await params;

  return <AdminVendorDetailLiveContent vendorId={id} />;
}
