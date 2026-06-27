"use client";

import { calculateTourPackageBookingTotal } from "@/features/tour-packages/booking/calculate-tour-package-booking-total";
import type {
  TourPackageDetail,
  TourPackageTier,
} from "@/features/tour-packages/data/tour-package-booking";
import { useFormatPrice } from "@/hooks/use-format-price";
import { useBookingContent } from "@/hooks/use-booking-content";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

type TourPackageBookingSummaryCardProps = {
  tourPackage: TourPackageDetail;
  tiers: TourPackageTier[];
  selectedTierId: string;
  onSelectTier: (tierId: string) => void;
  onBookNow: () => void;
  ctaKey?: TranslationKey;
};

export function TourPackageBookingSummaryCard({
  tourPackage,
  tiers,
  selectedTierId,
  onSelectTier,
  onBookNow,
  ctaKey = "common.bookNow",
}: TourPackageBookingSummaryCardProps) {
  const t = useTranslation();
  const { labelContent } = useBookingContent();
  const formatPrice = useFormatPrice();
  const selectedTier =
    tiers.find((tier) => tier.id === selectedTierId) ?? tiers[0];

  if (!selectedTier) return null;

  const pricing = calculateTourPackageBookingTotal({
    tierPrice: selectedTier.price,
    taxesAndFees: tourPackage.taxesAndFees,
    currency: tourPackage.currency,
    tierName: selectedTier.name,
  });

  const isProceedCta = ctaKey === "booking.cta.proceedToPay";

  return (
    <aside className="rounded-xl bg-white p-5">
      <h2 className="text-base font-medium font-satoshi text-foreground">
        {t("booking.summary.selectPackage")}
      </h2>

      <div className="mt-4 overflow-hidden rounded-[10px] border border-[#D9D9D9] bg-white">
        <div className="divide-y divide-[#E5E5E5]">
          {tiers.map((tier) => {
            const isSelected = tier.id === selectedTierId;

            return (
              <label key={tier.id} className="block cursor-pointer px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <input
                      type="radio"
                      name="tour-package-tier-summary"
                      checked={isSelected}
                      onChange={() => onSelectTier(tier.id)}
                      className="h-4 w-4 shrink-0 accent-[#D85A30]"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold font-inter text-[#606060]">
                        {labelContent(tier.name)}
                      </p>
                      <p className="text-xs font-medium font-satoshi text-foreground/70">
                        {labelContent(tier.duration)}
                      </p>
                    </div>
                  </div>
                  <p className="shrink-0 text-sm font-semibold font-inter text-foreground">
                    {formatPrice(tourPackage.currency, tier.price)}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      <h3 className="mt-5 text-base font-medium font-satoshi text-foreground">
        {t("booking.summary.priceDetails")}
      </h3>

      <div className="mt-2 rounded-xl bg-[#FFF1EA] p-4">
        <div className="space-y-2 text-sm font-satoshi">
          <div className="flex items-start justify-between gap-3">
            <span className="text-foreground/80">
              {labelContent(selectedTier.name)} x {labelContent(selectedTier.duration)} x{" "}
              <span className="font-bold text-foreground">
                {formatPrice(tourPackage.currency, selectedTier.price)}
              </span>
            </span>
            <span className="shrink-0 font-medium text-foreground">
              {formatPrice(tourPackage.currency, pricing.subtotal)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-foreground/80">{t("booking.summary.taxesAndFees")}</span>
            <span className="font-medium text-foreground">
              {formatPrice(tourPackage.currency, pricing.taxesAndFees)}
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onBookNow}
        className={`mt-5 w-full rounded-md bg-[#D85A30] px-5 py-3 text-sm font-bold font-montserrat text-white transition-opacity hover:opacity-90 ${
          isProceedCta ? "uppercase tracking-wide" : ""
        }`}
      >
        {t(ctaKey)}
      </button>
    </aside>
  );
}
