"use client";

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import type { ReactNode } from "react";

/**
 * Provides `useSession()` to client components. Mounted once at the root
 * layout so any client component can call `useSession()` without crashing.
 * Pass the server-resolved `session` to hydrate without a client refetch flash.
 */
export function AuthProvider({
  children,
  session,
}: {
  children: ReactNode;
  session?: Session | null;
}) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
