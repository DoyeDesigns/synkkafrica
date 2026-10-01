import { Suspense } from "react";

import { AdminVerificationsLiveContent } from "@/features/admin/components/admin-verifications-live-content";

// Filters and the selected document live in the URL (useSearchParams), so the
// page renders under a Suspense boundary.
export default function AdminVerificationsPage() {
  return (
    <Suspense fallback={null}>
      <AdminVerificationsLiveContent />
    </Suspense>
  );
}
