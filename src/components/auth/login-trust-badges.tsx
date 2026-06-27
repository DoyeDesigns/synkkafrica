"use client";

import Image from "next/image";

import { useTranslation } from "@/hooks/use-translation";

export function LoginTrustBadges() {
  const t = useTranslation();

  return (
    <div className="flex flex-wrap items-center justify-center gap-8 pt-10">
      <div className="flex items-center gap-2">
        <Image src="/secured.png" alt="" width={22} height={22} className="h-[22px] w-[22px]" />
        <span className="text-sm font-normal font-satoshi text-foreground">
          {t("common.secured")}
        </span>
      </div>

      <Image
        src="/paystack.png"
        alt="Paystack"
        width={100}
        height={24}
        className="h-6 w-auto object-contain"
      />

      <Image
        src="/stripe.png"
        alt="Stripe"
        width={72}
        height={72}
        className="h-9 w-auto object-contain"
      />
    </div>
  );
}
