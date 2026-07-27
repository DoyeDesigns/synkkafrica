import { AdminUserDetailContent } from "@/features/admin/components/admin-user-detail-content";

type AdminUserDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminUserDetailPage({ params }: AdminUserDetailPageProps) {
  const { id } = await params;

  return <AdminUserDetailContent userId={id} />;
}
