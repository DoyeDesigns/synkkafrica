import { signIn } from "@/auth";

export function EmailSignIn() {
  return (
    <form
      action={async (formData) => {
        "use server";
        const email = formData.get("email");

        if (typeof email !== "string" || !email) {
          return;
        }

        await signIn("email", { email, redirectTo: "/" });
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
      <button
        type="submit"
        className="flex h-11 w-full items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium transition-colors hover:bg-zinc-50"
      >
        Continue with Magic Link
      </button>
    </form>
  );
}
