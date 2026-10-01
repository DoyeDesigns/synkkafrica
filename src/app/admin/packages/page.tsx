import { Suspense } from "react";

import { SkeletonList } from "@/features/admin/components/admin-ui";
import { AdminPackagesLiveContent } from "@/features/admin/components/admin-packages-live-content";

export default function AdminPackagesPage() {
  // The content reads ?new=1 via useSearchParams, which needs a Suspense
  // boundary for the static shell.
  return (
    <Suspense fallback={<SkeletonList />}>
      <AdminPackagesLiveContent />
    </Suspense>
  );
}
