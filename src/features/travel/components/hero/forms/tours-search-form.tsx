"use client";

import { Calendar, Search } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

import { getDefaultCheckInDate } from "@/features/travel/booking/booking-params";
import {
  HeroField,
  HeroInputShell,
  HeroSearchButton,
} from "@/features/travel/components/hero/hero-form-primitives";
import { HeroDestinationField } from "@/features/travel/components/hero/hero-destination-field";
import { listExperienceDestinations } from "@/lib/api/experiences";
import { useTranslation } from "@/hooks/use-translation";

type ToursSearchFormProps = {
  onSubmit: (fields: Record<string, string>) => void;
};

export function ToursSearchForm({ onSubmit }: ToursSearchFormProps) {
  const t = useTranslation();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(
    () => searchParams.get("query") ?? "",
  );
  const [location, setLocation] = useState(
    () => searchParams.get("location") ?? "",
  );
  const [date, setDate] = useState(
    () => searchParams.get("date") ?? getDefaultCheckInDate(),
  );

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          query: query.trim(),
          location: location.trim(),
          date,
        });
      }}
    >
      <HeroInputShell>
        <HeroField
          icon={<Search className="h-4 w-4 shrink-0" />}
          placeholder={t("hero.tours.searchPlaceholder")}
          value={query}
          onChange={setQuery}
        />
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
        />
        <HeroField
          icon={<Calendar className="h-4 w-4 shrink-0" />}
          placeholder={t("hero.tours.startDate")}
          value={date}
          onChange={setDate}
          type="date"
          min={new Date().toISOString().split("T")[0]}
        />
        <HeroSearchButton label={t("hero.search")} variant="blue" className="rounded-lg" />
      </HeroInputShell>
    </form>
  );
}
