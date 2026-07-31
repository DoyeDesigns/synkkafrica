import { AdminNotAvailable } from "@/features/admin/components/admin-not-available";

export default function AdminSupportPage() {
  return (
    <AdminNotAvailable
      title="Support"
      note="Support tickets aren't wired to a backend yet."
    />
  );
}
