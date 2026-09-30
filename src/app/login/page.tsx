import { LoginPageContent } from "@/components/auth/login-page-content";
import { isBackendReady } from "@/lib/env";
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
    />
  );
}
