import { AdminLoginContent } from "@/features/admin/components/admin-login-content";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { reset } = await searchParams;
  return <AdminLoginContent passwordUpdated={reset === "success"} />;
}
