"use client";

import Image from "next/image";

import { useTranslation } from "@/hooks/use-translation";
import { signInWithGoogleAction } from "@/lib/auth/actions";

export function LoginGoogleButton() {
  const t = useTranslation();

  return (
    <form action={signInWithGoogleAction}>
      <button
        type="submit"
        className="flex h-12 w-full items-center justify-center gap-3 rounded-lg bg-[#2B6AFF] px-4 text-sm font-bold font-montserrat text-white transition-opacity hover:opacity-90"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white">
          <Image src="/google.png" alt="" width={16} height={16} className="h-4 w-4" />
        </span>
        {t("login.signInGoogle")}
      </button>
    </form>
  );
}
