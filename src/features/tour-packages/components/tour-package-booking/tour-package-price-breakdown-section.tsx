"use client";

import { DisplayPrice } from "@/components/display-price";
import type { TourPackageDetail } from "@/features/tour-packages/data/tour-package-booking";
import { useTranslation } from "@/hooks/use-translation";

type TourPackagePriceBreakdownSectionProps = {
  tourPackage: TourPackageDetail;
  onBookNow: () => void;
};

export function TourPackagePriceBreakdownSection({
  tourPackage,
  onBookNow,
}: TourPackagePriceBreakdownSectionProps) {
  const t = useTranslation();

  return (
    <section className="space-y-5">
      <h2 className="text-lg font-bold font-montserrat text-foreground">
        {t("booking.package.priceBreakdown")}
      </h2>

      <div className="rounded-2xl border border-[#E5E5E5] bg-white p-5">
        <div className="space-y-3 text-sm font-medium font-satoshi">
          {tourPackage.priceLineItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4">
              <span className="text-foreground/80">{item.label}</span>
              <span className="text-foreground">
                <DisplayPrice currency={tourPackage.currency} amount={item.amount} />
              </span>
            </div>
          ))}

          <div className="flex items-center justify-between gap-4 text-[#1B9B3C]">
            <span>{t("booking.package.packageDiscount")}</span>
            <span>
              -
              <DisplayPrice
                currency={tourPackage.currency}
                amount={tourPackage.packageDiscount}
              />
            </span>
          </div>

          <div className="border-t border-[#E5E5E5] pt-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-base font-bold font-satoshi text-foreground">
                {t("booking.package.packagePrice")}
              </span>
              <span className="text-2xl font-bold font-satoshi text-[#D85A30]">
                <DisplayPrice
                  currency={tourPackage.currency}
                  amount={tourPackage.packagePrice}
                />
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onBookNow}
          className="mt-6 w-full rounded-md bg-[#D85A30] px-5 py-3.5 text-sm font-bold font-montserrat text-white transition-opacity hover:opacity-90 sm:w-auto sm:min-w-[200px]"
        >
          {t("common.bookNow")}
        </button>
      </div>
    </section>
  );
}
