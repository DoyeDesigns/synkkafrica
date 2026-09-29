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
  // The backend access token lives 1h (JWT_VENDOR_ACCESS_TTL) while this
  // session cookie lasts 30 days, so a tab left open outlives its token. Poll
  // well inside that window: each refetch runs the jwt() callback server-side,
  // which rotates the backend tokens and hands the client a live one. Without
  // this the context keeps serving whatever it was hydrated with, and every
  // authenticated call fails until a manual reload.
  //
  // SessionProvider only reads `session` on mount — it ignores later prop
  // changes. A server-action sign-out/sign-in re-renders the root layout with
  // the new server session but is a soft navigation, so without a key the
  // client would keep the previous user's session (and, via the nested
  // QueryProvider, their cached queries). Keying on the identity remounts the
  // provider subtree whenever the signed-in principal changes.
  const identity = session?.user
    ? `${session.user.role ?? "customer"}:${session.user.id ?? session.user.email ?? ""}`
    : "anonymous";

  return (
    <SessionProvider
      key={identity}
      session={session}
      refetchInterval={10 * 60}
      refetchOnWindowFocus
    >
      {children}
    </SessionProvider>
  );
}
