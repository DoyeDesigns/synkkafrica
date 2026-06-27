"use client";

import { Star } from "lucide-react";

import { useBookingContent } from "@/hooks/use-booking-content";
import { useTranslation } from "@/hooks/use-translation";

type CurrentOffersSectionProps = {
  offers: string[];
};

export function CurrentOffersSection({ offers }: CurrentOffersSectionProps) {
  const t = useTranslation();
  const { labelContent } = useBookingContent();
  const columns = [offers, offers, offers];

  return (
    <section className="pb-10 pt-5">
      <h2 className="text-base font-semibold font-inter text-foreground">
        {t("booking.property.currentOffers")}
      </h2>

      <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {columns.map((columnOffers, columnIndex) => (
          <ul key={columnIndex} className="space-y-3">
            {columnOffers.map((offer) => (
              <li
                key={`${columnIndex}-${offer}`}
                className="flex items-start gap-2 text-sm font-normal font-inter text-foreground"
              >
                <Star className="mt-0.5 h-4 w-4 shrink-0 fill-amber-400 text-amber-400" />
                {labelContent(offer)}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}
