"use client";

import { calculateTourBookingTotal } from "@/features/travel/booking/calculate-tour-booking-total";
import { useBookingContent } from "@/hooks/use-booking-content";
import { useFormatPrice } from "@/hooks/use-format-price";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";
import type { TourDetail, TourExperienceOption } from "@/features/travel/data/tour-booking";

type TourBookingSummaryCardProps = {
  tour: TourDetail;
  options: TourExperienceOption[];
  selectedOptionId: string;
  onSelectOption: (optionId: string) => void;
  onBookNow: () => void;
  ctaKey?: TranslationKey;
};

export function TourBookingSummaryCard({
  tour,
  options,
  selectedOptionId,
  onSelectOption,
  onBookNow,
  ctaKey = "common.bookNow",
}: TourBookingSummaryCardProps) {
  const t = useTranslation();
  const { labelContent } = useBookingContent();
  const formatPrice = useFormatPrice();
  const selectedOption =
    options.find((option) => option.id === selectedOptionId) ?? options[0];

  if (!selectedOption) return null;

  const pricing = calculateTourBookingTotal({
    optionPrice: selectedOption.price,
    taxesAndFees: tour.taxesAndFees,
    currency: tour.currency,
    optionName: selectedOption.name,
  });

  const isProceedCta = ctaKey === "booking.cta.proceedToPay";

  return (
    <aside className="rounded-xl bg-white p-5">
      <h2 className="text-base font-medium font-satoshi text-foreground">
        {t("booking.summary.selectExperience")}
      </h2>

      <div className="mt-4 overflow-hidden rounded-[10px] border border-[#D9D9D9] bg-white">
        <div className="divide-y divide-[#E5E5E5]">
          {options.map((option) => {
            const isSelected = option.id === selectedOptionId;

            return (
              <label key={option.id} className="block cursor-pointer px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <input
                      type="radio"
                      name="tour-experience-summary"
                      checked={isSelected}
                      onChange={() => onSelectOption(option.id)}
                      className="h-4 w-4 shrink-0 accent-[#D85A30]"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold font-inter text-[#606060]">
                        {labelContent(option.name)}
                      </p>
                      <p className="text-xs font-medium font-satoshi text-foreground/70">
                        {labelContent(option.duration)}
                      </p>
                    </div>
                  </div>
                  <p className="shrink-0 text-sm font-semibold font-inter text-foreground">
                    {formatPrice(tour.currency, option.price)}
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
              {labelContent(selectedOption.name)} x {labelContent(selectedOption.duration)} x{" "}
              <span className="font-bold text-foreground">
                {formatPrice(tour.currency, selectedOption.price)}
              </span>
            </span>
            <span className="shrink-0 font-medium text-foreground">
              {formatPrice(tour.currency, pricing.subtotal)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-foreground/80">{t("booking.summary.taxesAndFees")}</span>
            <span className="font-medium text-foreground">
              {formatPrice(tour.currency, pricing.taxesAndFees)}
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
