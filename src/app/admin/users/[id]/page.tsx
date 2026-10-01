import { Suspense } from "react";

import { AdminUserDetailLiveContent } from "@/features/admin/components/admin-user-detail-live-content";

type AdminUserDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminUserDetailPage({
  params,
}: AdminUserDetailPageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={null}>
      <AdminUserDetailLiveContent userId={id} />
    </Suspense>
  );
}
