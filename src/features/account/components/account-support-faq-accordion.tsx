"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { ACCOUNT_SUPPORT_FAQ_ITEMS } from "@/features/account/data/account-support";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

export function AccountSupportFaqAccordion() {
  const t = useTranslation();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="rounded-xl border border-[#EEEEEE] p-5">
      <h3 className="text-xs font-bold tracking-wide font-satoshi text-[#676565] uppercase">
        {t("account.support.commonQuestions")}
      </h3>

      <div className="mt-4 divide-y divide-[#EEEEEE]">
        {ACCOUNT_SUPPORT_FAQ_ITEMS.map((item) => {
          const isOpen = openId === item.id;

          return (
            <div key={item.id}>
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : item.id)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-3 py-3 text-left"
              >
                <span className="text-sm font-medium font-satoshi text-[#2F2F2F]">
                  {t(item.questionKey as TranslationKey)}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-[#676565] transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  strokeWidth={1.75}
                />
              </button>

              {isOpen ? (
                <p className="pb-3 text-sm font-medium font-satoshi leading-relaxed text-[#676565]">
                  {t(item.answerKey as TranslationKey)}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
