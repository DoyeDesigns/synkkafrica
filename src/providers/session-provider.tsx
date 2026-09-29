"use client";

import { SessionProvider, signOut, useSession } from "next-auth/react";
import type { Session } from "next-auth";
import { useEffect, type ReactNode } from "react";

import {
  LOGIN_ACCOUNT_BLOCKED_URL,
  SESSION_ERROR_ACCOUNT_BLOCKED,
  SESSION_ERROR_REVOKED,
} from "@/lib/auth/session-errors";

// Signs a customer out once the jwt() callback reports the backend
// definitively rejected their refresh token (account blocked by an admin, or
// tokens revoked). Transient refresh failures ("RefreshTokenError") are left
// alone so a network blip doesn't log anyone out.
function SessionErrorWatcher() {
  const { data: session } = useSession();
  const error = session?.error;

  useEffect(() => {
    if (
      error === SESSION_ERROR_ACCOUNT_BLOCKED ||
      error === SESSION_ERROR_REVOKED
    ) {
      void signOut({
        redirectTo:
          error === SESSION_ERROR_ACCOUNT_BLOCKED
            ? LOGIN_ACCOUNT_BLOCKED_URL
            : "/login",
      });
    }
  }, [error]);

  return null;
}

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
  // SessionProvider only reads `session` on its first mount. After a
  // client-side login the root layout can pass the new session, but the
  // provider keeps the logged-out one until it remounts.
  const sessionKey = session?.user?.id ?? "signed-out";

  return (
    <SessionProvider
      key={sessionKey}
      session={session}
      refetchInterval={10 * 60}
      refetchOnWindowFocus
    >
      <SessionErrorWatcher />
      {children}
    </SessionProvider>
  );
}
