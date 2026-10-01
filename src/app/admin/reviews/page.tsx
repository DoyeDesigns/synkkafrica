import { Suspense } from "react";

import { AdminReviewsLiveContent } from "@/features/admin/components/admin-reviews-live-content";

// The live page keeps its filters in the query string (useSearchParams), so it
// renders on the client under a Suspense boundary.
export default function AdminReviewsPage() {
  return (
    <Suspense fallback={<AdminListFallback />}>
      <AdminReviewsLiveContent />
    </Suspense>
  );
}

function AdminListFallback() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading reviews">
      <span className="block h-6 w-40 animate-pulse rounded bg-[#EEEEEE]" />
      {Array.from({ length: 4 }).map((_, i) => (
        <span key={i} className="block h-24 animate-pulse rounded-xl bg-[#F5F5F5]" />
      ))}
    </div>
  );
}
