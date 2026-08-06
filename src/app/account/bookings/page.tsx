import { AccountBookingsContent } from "@/features/account/components/account-bookings-content";
import { getAccountSession } from "@/features/account/get-account-session";

export default async function AccountBookingsPage() {
  const session = await getAccountSession();

  return (
    <AccountBookingsContent
      userId={session?.user?.id ?? "guest"}
      userEmail={session?.user?.email ?? "guest@synkafrica.com"}
      authorName={session?.user?.name ?? "Guest"}
    />
  );
}
