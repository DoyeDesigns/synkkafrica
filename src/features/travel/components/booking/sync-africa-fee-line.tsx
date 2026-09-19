"use client";

import { useTranslation } from "@/hooks/use-translation";

type SyncAfricaFeeLineProps = {
  formattedAmount: string;
};

export function SyncAfricaFeeLine({ formattedAmount }: SyncAfricaFeeLineProps) {
  const t = useTranslation();

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-foreground/80">
        {t("booking.summary.additionalFees")}{" "}
        <span className="text-foreground/60">
          ({t("booking.summary.syncAfricaFees")})
        </span>
      </span>
      <span className="shrink-0 font-medium text-foreground">{formattedAmount}</span>
    </div>
  );
}
