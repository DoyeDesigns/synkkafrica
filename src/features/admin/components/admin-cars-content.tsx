"use client";

import { AdminListingsContent } from "@/features/admin/components/admin-listings-content";
import { ADMIN_CARS } from "@/features/admin/data/admin-cars";

export function AdminCarsContent() {
  return <AdminListingsContent kind="cars" initialListings={ADMIN_CARS} />;
}
