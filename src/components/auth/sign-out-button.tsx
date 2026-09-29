import { signOutAction } from "@/lib/auth/actions";

// Server-rendered sign-out form. Uses the shared action so the post-logout
// redirect is a relative path (never an AUTH_URL-derived absolute URL).
export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
      >
        Sign out
      </button>
    </form>
  );
}
