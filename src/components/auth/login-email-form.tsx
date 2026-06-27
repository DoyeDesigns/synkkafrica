"use client";

import { Mail } from "lucide-react";

import { useTranslation } from "@/hooks/use-translation";
import { signInWithEmailAction } from "@/lib/auth/actions";

export function LoginEmailForm() {
  const t = useTranslation();

  return (
    <form action={signInWithEmailAction} className="space-y-4">
      <div className="relative">
        <Mail
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9E9E9E]"
          strokeWidth={1.75}
        />
        <input
          type="email"
          name="email"
          required
          placeholder={t("login.emailPlaceholder")}
          className="h-12 w-full rounded-lg border border-[#C9C9C9] bg-white pl-11 pr-4 text-sm font-medium font-satoshi text-foreground outline-none placeholder:text-[#BDBCBC] focus:border-[#004785]"
        />
      </div>

      <button
        type="submit"
        className="flex h-12 w-full items-center justify-center rounded-lg bg-[#3A3A3A] text-sm font-bold font-montserrat text-white transition-opacity hover:opacity-90"
      >
        {t("common.continue")}
      </button>
    </form>
  );
}
