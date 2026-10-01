import { Suspense } from "react";

import { AdminUsersLiveContent } from "@/features/admin/components/admin-users-live-content";

// Filters live in the URL (useSearchParams), so the list renders under a
// Suspense boundary.
export default function AdminUsersPage() {
  return (
    <Suspense fallback={null}>
      <AdminUsersLiveContent />
    </Suspense>
  );
}
