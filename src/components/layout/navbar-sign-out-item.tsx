"use client";

import { LogOut } from "lucide-react";

import { signOutAction } from "@/lib/auth/actions";

type NavbarSignOutItemProps = {
  label: string;
};

export function NavbarSignOutItem({ label }: NavbarSignOutItemProps) {
  return (
    <form action={signOutAction} className="px-2">
      <button
        type="submit"
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium font-satoshi text-[#E53935] transition-colors hover:bg-red-50"
      >
        <LogOut className="h-5 w-5 shrink-0" strokeWidth={1.75} />
        {label}
      </button>
    </form>
  );
}
