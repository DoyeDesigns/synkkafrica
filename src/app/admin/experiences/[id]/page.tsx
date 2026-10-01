import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

// Listing detail lives at /admin/listings/[id] for every category; this
// path is kept so older links still land on the live page.
export default async function AdminCategoryListingDetailPage({
  params,
}: PageProps) {
  const { id } = await params;
  redirect(`/admin/listings/${id}`);
}
