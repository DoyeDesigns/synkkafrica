import { Suspense } from "react";

import { AdminSupportContent } from "@/features/admin/components/admin-support-content";
import { SkeletonList } from "@/features/admin/components/admin-ui";

export default function AdminSupportPage() {
  // The content keeps its filters in the URL (useSearchParams), which needs a
  // Suspense boundary for the static shell.
  return (
    <Suspense fallback={<SkeletonList />}>
      <AdminSupportContent />
    </Suspense>
  );
}
