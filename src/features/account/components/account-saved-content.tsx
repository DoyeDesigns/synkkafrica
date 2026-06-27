"use client";

import { PropertyListingCard } from "@/features/travel/components/landing/property-listing-card";
import { CarRentalResultCard } from "@/features/travel/components/results/car-rentals/car-rental-result-card";
import { TRAVEL_CAROUSEL_SCROLL_CLASS } from "@/features/travel/constants";

import { SavedSection } from "@/features/account/components/saved-section";
import { SavedTourCard } from "@/features/account/components/saved-tour-card";
import {
  SAVED_ACCOMMODATIONS,
  SAVED_CARS,
  SAVED_TOURS,
} from "@/features/account/data/account-saved";
import { useTranslation } from "@/hooks/use-translation";

const savedScrollClass = `flex w-full min-w-0 max-w-full gap-5 overflow-x-auto pb-2 ${TRAVEL_CAROUSEL_SCROLL_CLASS}`;

export function AccountSavedContent() {
  const t = useTranslation();

  return (
    <section className="space-y-20 overflow-hidden rounded-2xl border border-[#EEEEEE] bg-white p-6 shadow-sm sm:p-8">
      <SavedSection title={t("account.saved.accommodations")} count={SAVED_ACCOMMODATIONS.length}>
        <div className="min-w-0 overflow-hidden">
          <div className={savedScrollClass}>
            {SAVED_ACCOMMODATIONS.map((item) => (
              <PropertyListingCard key={item.id} item={item} saved />
            ))}
          </div>
        </div>
      </SavedSection>

      <SavedSection title={t("account.saved.cars")} count={SAVED_CARS.length}>
        <div className="min-w-0 overflow-hidden">
          <div className={savedScrollClass}>
            {SAVED_CARS.map((item) => (
              <div key={item.id} className="w-[320px] shrink-0">
                <CarRentalResultCard item={item} saved />
              </div>
            ))}
          </div>
        </div>
      </SavedSection>

      <SavedSection title={t("account.saved.tours")} count={SAVED_TOURS.length}>
        <div className="min-w-0 overflow-hidden">
          <div className={savedScrollClass}>
            {SAVED_TOURS.map((item) => (
              <SavedTourCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </SavedSection>
    </section>
  );
}
