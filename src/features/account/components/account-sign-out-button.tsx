"use client";

import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";

import { useTranslation } from "@/hooks/use-translation";
import { signOutAction } from "@/lib/auth/actions";

export function AccountSignOutButton() {
  const t = useTranslation();
  const queryClient = useQueryClient();

  return (
    <form
      action={signOutAction}
      // Drop cached per-user data (bookings, profile…) before the session ends.
      onSubmit={() => queryClient.clear()}
    >
      <button
        type="submit"
        className="flex h-16 w-full items-center gap-3 rounded-[10px] border border-[#E8E8E8] bg-white px-4 py-3.5 text-left text-sm font-medium font-satoshi text-foreground transition-colors hover:bg-zinc-50"
      >
        <LogOut className="h-5 w-5 shrink-0" strokeWidth={1.75} />
        {t("common.signOut")}
      </button>
    </form>
  );
}
