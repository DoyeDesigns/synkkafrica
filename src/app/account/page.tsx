import { AccountProfileCard } from "@/features/account/components/account-profile-card";
import { DeleteAccountButton } from "@/features/account/components/delete-account-button";
import { getAccountSession } from "@/features/account/get-account-session";

export default async function AccountPage() {
  const session = await getAccountSession();

  if (!session?.user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <AccountProfileCard session={session} />
      <div className="flex justify-end">
        <DeleteAccountButton />
      </div>
    </div>
  );
}
