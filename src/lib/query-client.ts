import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { signOut } from "next-auth/react";

import { isAccountBlockedError } from "@/lib/api/backend";
import { LOGIN_ACCOUNT_BLOCKED_URL } from "@/lib/auth/session-errors";

// A customer blocked by an admin gets 403 ACCOUNT_BLOCKED from every
// signed-in route. Sign them out once and land them on the login page with
// the explanation, instead of leaving each screen to show a generic error.
let signingOutBlocked = false;
function handleAccountBlocked(err: unknown) {
  if (signingOutBlocked || !isAccountBlockedError(err)) return;
  signingOutBlocked = true;
  void signOut({ redirectTo: LOGIN_ACCOUNT_BLOCKED_URL });
}

export function createQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({ onError: handleAccountBlocked }),
    mutationCache: new MutationCache({ onError: handleAccountBlocked }),
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}
