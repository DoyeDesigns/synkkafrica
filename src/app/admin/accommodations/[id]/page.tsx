import { AdminListingDetailPage } from "@/features/admin/components/admin-listing-detail-page";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function AdminAccommodationDetailPage(props: PageProps) {
  return <AdminListingDetailPage {...props} kind="accommodations" />;
}
