import { CredentialsSignIn } from "@/components/auth/credentials-sign-in";
import { EmailSignIn } from "@/components/auth/email-sign-in";
import { GoogleSignIn } from "@/components/auth/google-sign-in";
import {
  hasGoogleAuth,
  hasMongoUri,
  isBackendReady,
} from "@/lib/env";

export default function LoginPage() {
  const backendReady = isBackendReady();
  const showGoogle = hasGoogleAuth();
  const showDatabaseAuth = hasMongoUri();

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm space-y-6">
        {!backendReady && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Backend env vars are not set yet. You can keep building the
            frontend — sign-in will work once your backend teammate adds{" "}
            <code className="font-mono">MONGODB_URI</code>,{" "}
            <code className="font-mono">AUTH_SECRET</code>, and Google OAuth
            keys to <code className="font-mono">.env.local</code>.
          </p>
        )}

        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="text-sm text-zinc-600">
            {backendReady
              ? "Continue with Google, email & password, or a magic link."
              : "Sign-in options appear here when backend credentials are ready."}
          </p>
        </div>

        {showGoogle && <GoogleSignIn />}

        {showGoogle && showDatabaseAuth && (
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-200" />
            <span className="text-xs text-zinc-500">or</span>
            <div className="h-px flex-1 bg-zinc-200" />
          </div>
        )}

        {showDatabaseAuth && <CredentialsSignIn />}

        {showDatabaseAuth && (
          <>
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-zinc-200" />
              <span className="text-xs text-zinc-500">or</span>
              <div className="h-px flex-1 bg-zinc-200" />
            </div>
            <EmailSignIn />
          </>
        )}
      </div>
    </main>
  );
}
