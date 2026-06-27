import { AccountSidebar } from "@/features/account/components/account-sidebar";
import { getAccountSession } from "@/features/account/get-account-session";
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

  return (
    <div className="min-h-full bg-[#F5F5F5]">
      <div className="mx-auto max-w-6xl px-4 pb-12 pt-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <AccountSidebar />
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
