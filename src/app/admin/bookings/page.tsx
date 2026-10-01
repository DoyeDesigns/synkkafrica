import { Suspense } from "react";

import { AdminBookingsLiveContent } from "@/features/admin/components/admin-bookings-live-content";

// The live page keeps its filters in the query string (useSearchParams), so it
// renders on the client under a Suspense boundary.
export default function AdminBookingsPage() {
  return (
    <Suspense fallback={<AdminListFallback />}>
      <AdminBookingsLiveContent />
    </Suspense>
  );
}

function AdminListFallback() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading bookings">
      <span className="block h-6 w-40 animate-pulse rounded bg-[#EEEEEE]" />
      {Array.from({ length: 4 }).map((_, i) => (
        <span key={i} className="block h-24 animate-pulse rounded-xl bg-[#F5F5F5]" />
      ))}
    </div>
  );
}
