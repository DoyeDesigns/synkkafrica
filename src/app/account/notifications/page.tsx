import { AccountNotificationsContent } from "@/features/account/components/account-notifications-content";
import { getAccountSession } from "@/features/account/get-account-session";

export default async function AccountNotificationsPage() {
  const session = await getAccountSession();

  return (
    <AccountNotificationsContent
      userId={session?.user?.id ?? "guest"}
      userEmail={session?.user?.email ?? "guest@synkkaffric.com"}
    />
  );
}
