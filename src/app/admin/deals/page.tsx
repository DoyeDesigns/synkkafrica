import { Suspense } from "react";

import { AdminDealsLiveContent } from "@/features/admin/components/admin-deals-live-content";
import { SkeletonList } from "@/features/admin/components/admin-ui";

export default function AdminDealsPage() {
  // The content keeps its filters in the URL (useSearchParams), which needs a
  // Suspense boundary for the static shell.
  return (
    <Suspense fallback={<SkeletonList />}>
      <AdminDealsLiveContent />
    </Suspense>
  );
}
