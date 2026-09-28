"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

import { getDefaultCheckInDate } from "@/features/travel/booking/booking-params";
import {
  HeroInputShell,
  HeroSearchButton,
} from "@/features/travel/components/hero/hero-form-primitives";
import { HeroDateRangeField } from "@/features/travel/components/hero/hero-date-range-field";
import { HeroDestinationField } from "@/features/travel/components/hero/hero-destination-field";
import { useTranslation } from "@/hooks/use-translation";
import { listExperienceDestinations } from "@/lib/api/experiences";
import { searchCityFromLocation } from "@/lib/geo/city-supplements";

type ToursSearchFormProps = {
  onSubmit: (fields: Record<string, string>) => void;
};

export function ToursSearchForm({ onSubmit }: ToursSearchFormProps) {
  const t = useTranslation();
  const searchParams = useSearchParams();
  const [location, setLocation] = useState(() => {
    const value = searchParams.get("location") ?? "";
    return searchCityFromLocation(value) || value;
  });
  const [date, setDate] = useState(
    () => searchParams.get("date") ?? getDefaultCheckInDate(),
  );

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          location: searchCityFromLocation(location.trim()) || location.trim(),
          date,
        });
      }}
    >
      <HeroInputShell>
        <HeroDestinationField
          placeholder={t("hero.location")}
          value={location}
          onChange={setLocation}
          queryKey="experience-destinations"
          fetchDestinations={listExperienceDestinations}
          countLabel={(count) =>
            t(
              count === 1
                ? "hero.tours.destinationExperience"
                : "hero.tours.destinationExperiences",
              { count },
            )
          }
          listboxId="hero-tours-location-listbox"
        />
        <HeroDateRangeField
          fromLabel={t("hero.tours.startDate")}
          toLabel=""
          addDateLabel={t("hero.common.addDate")}
          fromDate={date}
          toDate=""
          onFromDateChange={setDate}
          onToDateChange={() => undefined}
          showToDate={false}
        />
        <HeroSearchButton label={t("hero.search")} variant="blue" className="rounded-lg" />
      </HeroInputShell>
    </form>
  );
}
