import { Suspense } from "react";

import { AdminAuditContent } from "@/features/admin/components/admin-audit-content";
import { SkeletonList } from "@/features/admin/components/admin-ui";

export default function AdminAuditPage() {
  // The content keeps its filters in the URL (useSearchParams), which needs a
  // Suspense boundary for the static shell.
  return (
    <Suspense fallback={<SkeletonList />}>
      <AdminAuditContent />
    </Suspense>
  );
}
