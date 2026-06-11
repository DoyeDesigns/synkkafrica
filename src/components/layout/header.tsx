import Link from "next/link";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { UserAvatar } from "@/components/auth/user-avatar";
import { auth } from "@/auth";

export async function Header() {
  const session = await auth();

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          SyncAfrica
        </Link>

        <nav className="flex items-center gap-4">
          {session?.user ? (
            <>
              <Link
                href="/account"
                className="text-sm text-zinc-600 transition-colors hover:text-zinc-900"
              >
                Account
              </Link>
              <UserAvatar session={session} />
              <SignOutButton />
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium text-zinc-900 transition-colors hover:text-zinc-600"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
