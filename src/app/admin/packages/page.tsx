import { Suspense } from "react";

import { AdminPackagesLiveContent } from "@/features/admin/components/admin-packages-live-content";

export default function AdminPackagesPage() {
  // The content reads ?new=1 via useSearchParams, which needs a Suspense
  // boundary for the static shell.
  return (
    <Suspense fallback={null}>
      <AdminPackagesLiveContent />
    </Suspense>
  );
}
