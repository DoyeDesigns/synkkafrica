import { Suspense } from "react";

import {
  AdminPayoutsLiveContent,
  AdminPayoutsSkeleton,
} from "@/features/admin/components/admin-payouts-live-content";

// The live content reads view state (search, status, period, page) from the
// URL via useSearchParams, so it needs a Suspense boundary.
export default function AdminPayoutsPage() {
  return (
    <Suspense fallback={<AdminPayoutsSkeleton />}>
      <AdminPayoutsLiveContent />
    </Suspense>
  );
}
