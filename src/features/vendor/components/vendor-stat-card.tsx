"use client";

import { Calendar, List, MoreHorizontal, Wallet, type LucideIcon } from "lucide-react";
import Link from "next/link";

import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

type VendorStatCardProps = {
  icon: LucideIcon;
  labelKey: TranslationKey;
  value: string;
  href?: string;
  linkKey?: TranslationKey;
};

export function VendorStatCard({
  icon: Icon,
  labelKey,
  value,
  href,
  linkKey,
}: VendorStatCardProps) {
  const t = useTranslation();

  return (
    <div className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm">
      <div className="">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
          <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#676565]" strokeWidth={1.75} />
          <p className="font-bold font-satoshi text-[#3C3C3C]">
            {t(labelKey)}
          </p>
          </div>
          <p className="mt-2 text-3xl font-bold font-inter text-[#D85A30]">
            {value}
          </p>
          {href && linkKey ? (
            <div className="flex justify-end">
              <Link
              href={href}
              className="mt-2 inline-block text-sm font-medium font-satoshi text-[#135391] underline underline-offset-2"
            >
              {t(linkKey)}
            </Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
