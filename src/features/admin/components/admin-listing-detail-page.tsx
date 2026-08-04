import {
  AdminListingDetailContent,
  AdminListingDetailNotFound,
} from "@/features/admin/components/admin-listing-detail-content";
import {
  getAdminListingById,
  type AdminListingKind,
} from "@/features/admin/data/admin-listings";

type AdminListingDetailPageProps = {
  params: Promise<{ id: string }>;
  kind: AdminListingKind;
};

export async function AdminListingDetailPage({
  params,
  kind,
}: AdminListingDetailPageProps) {
  const { id } = await params;
  const listing = getAdminListingById(kind, id);

  if (!listing) {
    return <AdminListingDetailNotFound kind={kind} />;
  }

  return <AdminListingDetailContent kind={kind} listing={listing} />;
}
