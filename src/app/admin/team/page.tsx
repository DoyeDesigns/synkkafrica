import { Suspense } from "react";

import { AdminTeamContent } from "@/features/admin/components/admin-team-content";
import { SkeletonList } from "@/features/admin/components/admin-ui";

export default function AdminTeamPage() {
  // The content keeps its filters in the URL (useSearchParams), which needs a
  // Suspense boundary for the static shell.
  return (
    <Suspense fallback={<SkeletonList />}>
      <AdminTeamContent />
    </Suspense>
  );
}
