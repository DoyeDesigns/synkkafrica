"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useTranslation } from "@/hooks/use-translation";

export function AccountContactSupportLink() {
  const pathname = usePathname();
  const t = useTranslation();
  const isActive = pathname.startsWith("/account/support");

  return (
    <Link
      href="/account/support"
      className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-medium font-satoshi text-white transition-colors ${
        isActive
          ? "bg-[#D85A30] hover:opacity-90"
          : "bg-[#676767] hover:opacity-90"
      }`}
    >
      <span>
        <Image src="/contact-support.png" alt="Help" width={24} height={24} />
      </span>
      {t("account.contactSupport")}
    </Link>
  );
}
