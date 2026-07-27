"use client";

import { AdminListingsContent } from "@/features/admin/components/admin-listings-content";
import { ADMIN_EXPERIENCES } from "@/features/admin/data/admin-experiences";

export function AdminExperiencesContent() {
  return <AdminListingsContent kind="experiences" initialListings={ADMIN_EXPERIENCES} />;
}
