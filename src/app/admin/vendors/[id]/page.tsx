import { AdminVendorDetailContent } from "@/features/admin/components/admin-vendor-detail-content";

type AdminVendorDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminVendorDetailPage({
  params,
}: AdminVendorDetailPageProps) {
  const { id } = await params;

  return <AdminVendorDetailContent vendorId={id} />;
}
