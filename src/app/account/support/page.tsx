import { AccountSupportContent } from "@/features/account/components/account-support-content";
import { getAccountSession } from "@/features/account/get-account-session";

export default async function AccountSupportPage() {
  const session = await getAccountSession();

  return (
    <AccountSupportContent
      userId={session?.user?.id ?? "guest"}
      userEmail={session?.user?.email ?? "guest@synkkaffric.com"}
    />
  );
}
