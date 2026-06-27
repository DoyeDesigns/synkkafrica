"use client";

import { calculateCarBookingTotal } from "@/features/travel/booking/calculate-car-booking-total";
import { useBookingContent } from "@/hooks/use-booking-content";
import { useFormatPrice } from "@/hooks/use-format-price";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";
import type { CarDetail, CarRentalPackage } from "@/features/travel/data/car-booking";

type CarBookingSummaryCardProps = {
  car: CarDetail;
  packages: CarRentalPackage[];
  selectedPackageId: string;
  onSelectPackage: (packageId: string) => void;
  onBookNow: () => void;
  ctaKey?: TranslationKey;
};

export function CarBookingSummaryCard({
  car,
  packages,
  selectedPackageId,
  onSelectPackage,
  onBookNow,
  ctaKey = "common.bookNow",
}: CarBookingSummaryCardProps) {
  const t = useTranslation();
  const { labelContent } = useBookingContent();
  const formatPrice = useFormatPrice();
  const selectedPackage =
    packages.find((pkg) => pkg.id === selectedPackageId) ?? packages[0];

  if (!selectedPackage) return null;

  const pricing = calculateCarBookingTotal({
    packagePrice: selectedPackage.price,
    taxesAndFees: car.taxesAndFees,
    currency: car.currency,
    packageName: selectedPackage.name,
  });

  const isProceedCta = ctaKey === "booking.cta.proceedToPay";

  return (
    <aside className="rounded-xl bg-white p-5">
      <h2 className="text-base font-medium font-satoshi text-foreground">
        {t("booking.summary.selectCar")}
      </h2>

      <div className="mt-4 overflow-hidden rounded-[10px] border border-[#D9D9D9] bg-white">
        <div className="divide-y divide-[#E5E5E5]">
          {packages.map((pkg) => {
            const isSelected = pkg.id === selectedPackageId;

            return (
              <label key={pkg.id} className="block cursor-pointer px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <input
                      type="radio"
                      name="car-package-summary"
                      checked={isSelected}
                      onChange={() => onSelectPackage(pkg.id)}
                      className="h-4 w-4 shrink-0 accent-[#D85A30]"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold font-inter text-[#606060]">
                        {labelContent(pkg.name)}
                      </p>
                      <p className="text-xs font-medium font-satoshi text-foreground/70">
                        {labelContent(pkg.hours)}
                      </p>
                    </div>
                  </div>
                  <p className="shrink-0 text-sm font-semibold font-inter text-foreground">
                    {formatPrice(car.currency, pkg.price)}
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
              {labelContent(selectedPackage.name)} x {labelContent(selectedPackage.hours)} x{" "}
              <span className="font-bold text-foreground">
                {formatPrice(car.currency, selectedPackage.price)}
              </span>
            </span>
            <span className="shrink-0 font-medium text-foreground">
              {formatPrice(car.currency, pricing.subtotal)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-foreground/80">{t("booking.summary.taxesAndFees")}</span>
            <span className="font-medium text-foreground">
              {formatPrice(car.currency, pricing.taxesAndFees)}
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
