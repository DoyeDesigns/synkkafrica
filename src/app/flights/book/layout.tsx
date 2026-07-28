import type { ReactNode } from "react";

import { AuthProvider } from "@/providers/session-provider";

// The booking + confirmation pages use `useSession()` (token for authenticated
// booking, and status polling), so this segment needs the SessionProvider.
export default function BookLayout({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
