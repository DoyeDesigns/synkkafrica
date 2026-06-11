import { signIn } from "@/auth";

export function GoogleSignIn() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("google", { redirectTo: "/" });
      }}
    >
      <button
        type="submit"
        className="flex h-11 w-full items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium transition-colors hover:bg-zinc-50"
      >
        Continue with Google
      </button>
    </form>
  );
}
