import { redirect } from "next/navigation";

// The old multi-step package wizard was a mock that never saved anything.
// Packages are created (and edited) on /admin/packages, which talks to the
// backend; keep this URL working for old links/bookmarks.
export default function AdminAddPackagePage() {
  redirect("/admin/packages?new=1");
}
