"use client";

import { useTranslation } from "@/hooks/use-translation";

export function NoReviewsCard() {
  const t = useTranslation();

  return (
    <section className="rounded-xl bg-white px-5 py-10 text-center">
      <p className="text-sm font-medium font-inter text-[#9A9A9A]">
        {t("common.noReviewsYet")}
      </p>
    </section>
  );
}
