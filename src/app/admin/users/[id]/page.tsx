import { redirect } from "next/navigation";

// There is no per-customer admin view yet (the backend has no customer
// detail endpoint); customers are managed from the users list.
export default function AdminUserDetailPage() {
  redirect("/admin/users");
}
