import { AccountProfileCard } from "@/features/account/components/account-profile-card";
import { DeleteAccountButton } from "@/features/account/components/delete-account-button";
import { ExportDataButton } from "@/features/account/components/export-data-button";
import { getAccountSession } from "@/features/account/get-account-session";
import { getProfile, type UserProfile } from "@/lib/api/users";

export default async function AccountPage() {
  const session = await getAccountSession();

  if (!session?.user) {
    return null;
  }

  // Real profile from the backend. In design-preview mode there's no backend
  // token, so we fall back to the session values inside the card.
  let profile: UserProfile | null = null;
  if (session.accessToken) {
    try {
      profile = await getProfile(session.accessToken);
    } catch {
      profile = null;
    }
  }

  return (
    <div className="space-y-6">
      <AccountProfileCard session={session} profile={profile} />
      <div className="flex flex-wrap items-center justify-end gap-3">
        {session.accessToken ? (
          <ExportDataButton token={session.accessToken} />
        ) : null}
        <DeleteAccountButton token={session.accessToken ?? null} />
      </div>
    </div>
  );
}
