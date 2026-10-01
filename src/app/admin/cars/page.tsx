import { Suspense } from "react";

import {
  AdminListingsLiveContent,
  AdminListingsSkeleton,
} from "@/features/admin/components/admin-listings-live-content";

// The list keeps its search / tab / sort / page in the URL (useSearchParams),
// which needs a Suspense boundary for the static prerender.
export default function AdmincarsPage() {
  return (
    <Suspense fallback={<AdminListingsSkeleton />}>
      <AdminListingsLiveContent category="cars" title="Car rentals" />
    </Suspense>
  );
}
