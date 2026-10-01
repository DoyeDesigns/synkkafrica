import { LoginPageContent } from "@/components/auth/login-page-content";
import { hasAppleAuth, hasGoogleAuth, isBackendReady } from "@/lib/env";
import { ACCOUNT_BLOCKED_SIGNIN_CODE } from "@/lib/auth/session-errors";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Set when a blocked customer was signed out (see SessionErrorWatcher /
  // query-client) so the form explains why instead of starting blank.
  const { error } = await searchParams;
  return (
    <LoginPageContent
      backendReady={isBackendReady()}
      accountBlocked={error === ACCOUNT_BLOCKED_SIGNIN_CODE}
      // Any other ?error= comes from a Google/Apple sign-in that didn't
      // complete (our exchange, or an Auth.js OAuth error type).
      socialFailed={
        typeof error === "string" && error !== ACCOUNT_BLOCKED_SIGNIN_CODE
      }
      googleEnabled={hasGoogleAuth()}
      appleEnabled={hasAppleAuth()}
    />
  );
}
