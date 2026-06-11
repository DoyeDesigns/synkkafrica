import { CredentialsSignIn } from "@/components/auth/credentials-sign-in";
import { EmailSignIn } from "@/components/auth/email-sign-in";
import { GoogleSignIn } from "@/components/auth/google-sign-in";

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="text-sm text-zinc-600">
            Continue with Google, email & password, or a magic link.
          </p>
        </div>

        <GoogleSignIn />

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-zinc-200" />
          <span className="text-xs text-zinc-500">or</span>
          <div className="h-px flex-1 bg-zinc-200" />
        </div>

        <CredentialsSignIn />

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-zinc-200" />
          <span className="text-xs text-zinc-500">or</span>
          <div className="h-px flex-1 bg-zinc-200" />
        </div>

        <EmailSignIn />
      </div>
    </main>
  );
}
