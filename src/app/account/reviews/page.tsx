import { AccountReviewsContent } from "@/features/account/components/account-reviews-content";
import { getAccountSession } from "@/features/account/get-account-session";

export default async function AccountReviewsPage() {
  const session = await getAccountSession();

  return (
    <AccountReviewsContent
      userId={session?.user?.id ?? "guest"}
      userEmail={session?.user?.email ?? "guest@synkkaffric.com"}
      authorName={session?.user?.name ?? "Guest"}
    />
  );
}
