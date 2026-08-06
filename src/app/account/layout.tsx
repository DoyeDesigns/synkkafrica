import { AccountSidebar } from "@/features/account/components/account-sidebar";
import { AccountUserPersistence } from "@/features/account/components/account-user-persistence";
import { getAccountSession } from "@/features/account/get-account-session";
import { AuthProvider } from "@/providers/session-provider";
import { redirect } from "next/navigation";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAccountSession();

  if (!session?.user) {
    redirect("/login");
  }

  // Account content components read the access token via useSession(), so this
  // segment needs the client SessionProvider.
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#F5F5F5]">
        <AccountUserPersistence
          userId={session.user.id ?? "guest"}
          userEmail={session.user.email ?? "guest@synkafrica.com"}
        />
        <div className="mx-auto max-w-6xl px-4 pb-12 pt-20 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
            <AccountSidebar />
            <div className="min-w-0">{children}</div>
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}
