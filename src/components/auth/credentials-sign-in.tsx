import { signIn } from "@/auth";

export function CredentialsSignIn() {
  return (
    <form
      action={async (formData) => {
        "use server";
        await signIn("credentials", formData);
      }}
      className="space-y-3"
    >
      <input
        type="email"
        name="email"
        required
        placeholder="you@example.com"
        className="h-11 w-full rounded-lg border border-zinc-200 px-4 text-sm outline-none focus:border-zinc-400"
      />
      <input
        type="password"
        name="password"
        required
        placeholder="Password"
        className="h-11 w-full rounded-lg border border-zinc-200 px-4 text-sm outline-none focus:border-zinc-400"
      />
      <button
        type="submit"
        className="flex h-11 w-full items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
      >
        Sign in with Email & Password
      </button>
    </form>
  );
}
