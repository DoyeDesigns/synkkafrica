import { Suspense } from "react";

import { AdminVendorsLiveContent } from "@/features/admin/components/admin-vendors-live-content";

// Filters live in the URL (useSearchParams), so the list renders under a
// Suspense boundary.
export default function AdminVendorsPage() {
  return (
    <Suspense fallback={null}>
      <AdminVendorsLiveContent />
    </Suspense>
  );
}
