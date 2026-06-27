"use client";

import { useBookingContent } from "@/hooks/use-booking-content";
import { useFormatPrice } from "@/hooks/use-format-price";
import { useTranslation } from "@/hooks/use-translation";
import type { TourPackageTier } from "@/features/tour-packages/data/tour-package-booking";

type TierSelectionTableProps = {
  tiers: TourPackageTier[];
  selectedTierId: string;
  currency: string;
  onSelectTier: (tierId: string) => void;
};

export function TierSelectionTable({
  tiers,
  selectedTierId,
  currency,
  onSelectTier,
}: TierSelectionTableProps) {
  const t = useTranslation();
  const { labelContent } = useBookingContent();
  const formatPrice = useFormatPrice();

  return (
    <div className="rounded-xl bg-white p-5 py-8 pb-10">
      <div className="mb-3 hidden grid-cols-[minmax(0,1.4fr)_140px_160px] gap-4 text-sm font-medium font-montserrat text-foreground md:grid">
        <span>{t("booking.table.packages")}</span>
        <span>{t("booking.table.duration")}</span>
        <span className="text-right">{t("booking.table.price")}</span>
      </div>

      <div className="overflow-hidden rounded-[10px] border border-[#D9D9D9] bg-white">
        <div className="divide-y divide-[#E5E5E5]">
          {tiers.map((tier) => {
            const isSelected = tier.id === selectedTierId;

            return (
              <label
                key={tier.id}
                className="block cursor-pointer transition-colors"
              >
                <div className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_140px_160px] md:items-center">
                  <div className="flex h-full items-center gap-3 px-4 py-4 sm:border-r sm:border-[#D9D9D9] md:px-5">
                    <input
                      type="radio"
                      name="tour-package-tier-selection"
                      checked={isSelected}
                      onChange={() => onSelectTier(tier.id)}
                      className="h-4 w-4 shrink-0 accent-[#D85A30]"
                    />
                    <span className="text-sm font-inter font-semibold text-[#606060]">
                      {labelContent(tier.name)}
                    </span>
                  </div>

                  <div className="flex h-full items-center justify-between px-4 py-4 sm:border-r sm:border-[#D9D9D9] md:justify-start md:px-5">
                    <span className="text-xs font-medium font-satoshi text-foreground/60 md:hidden">
                      {t("booking.table.duration")}
                    </span>
                    <span className="text-sm font-medium font-satoshi text-foreground">
                      {labelContent(tier.duration)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-4 py-4 md:justify-end md:px-5">
                    <span className="text-xs font-medium font-satoshi text-foreground/60 md:hidden">
                      {t("booking.table.price")}
                    </span>
                    <p className="text-base font-bold font-montserrat text-foreground">
                      {formatPrice(currency, tier.price)}
                    </p>
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
