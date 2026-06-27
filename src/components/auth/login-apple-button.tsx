"use client";

import Image from "next/image";

import { useTranslation } from "@/hooks/use-translation";

export function LoginAppleButton() {
  const t = useTranslation();

  return (
    <button
      type="button"
      className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-[#C9C9C9] bg-white px-4 text-sm font-bold font-montserrat text-foreground transition-colors hover:bg-[#FAFAFA]"
    >
      <Image src="/apple.png" alt="" width={18} height={18} className="h-[18px] w-[18px]" />
      {t("login.continueApple")}
    </button>
  );
}
