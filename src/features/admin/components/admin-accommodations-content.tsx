"use client";

import { AdminListingsContent } from "@/features/admin/components/admin-listings-content";
import { ADMIN_ACCOMMODATIONS } from "@/features/admin/data/admin-accommodations";

export function AdminAccommodationsContent() {
  return (
    <AdminListingsContent kind="accommodations" initialListings={ADMIN_ACCOMMODATIONS} />
  );
}
