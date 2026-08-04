import { AdminListingDetailLiveContent } from "@/features/admin/components/admin-listing-detail-live-content";

type AdminListingDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminListingDetailPage({
  params,
}: AdminListingDetailPageProps) {
  const { id } = await params;

  return <AdminListingDetailLiveContent listingId={id} />;
}
