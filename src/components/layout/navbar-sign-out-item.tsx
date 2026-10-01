"use client";

import { LogOut } from "lucide-react";

type NavbarSignOutItemProps = {
  label: string;
  // Opens the sign-out confirmation owned by the parent menu (the menu
  // unmounts on close, so the dialog can't live in here).
  onSelect: () => void;
};

export function NavbarSignOutItem({ label, onSelect }: NavbarSignOutItemProps) {
  return (
    <div className="px-2">
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={onSelect}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium font-satoshi text-[#E53935] transition-colors hover:bg-red-50"
      >
        <LogOut className="h-5 w-5 shrink-0" strokeWidth={1.75} />
        {label}
      </button>
    </div>
  );
}
