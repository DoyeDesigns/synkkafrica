import { signOut } from "@/auth";

export function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    >
      <button
        type="submit"
        className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
      >
        Sign out
      </button>
    </form>
  );
}
