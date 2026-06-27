"use client";

import { Trash2 } from "lucide-react";

import { useTranslation } from "@/hooks/use-translation";

export function DeleteAccountButton() {
  const t = useTranslation();

  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-[10px] border border-[#DD2222] bg-white px-5 py-2.5 text-sm font-medium font-satoshi text-[#DD2222] transition-colors hover:bg-[#FFF1EB]"
    >
      <Trash2 className="h-4 w-4" strokeWidth={1.75} />
      {t("account.deleteAccount")}
    </button>
  );
}
