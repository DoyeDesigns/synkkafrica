"use client";

import { Calendar, MapPin, Search } from "lucide-react";
import { useState } from "react";

import { getDefaultCheckInDate } from "@/features/travel/booking/booking-params";
import {
  HeroField,
  HeroInputShell,
  HeroSearchButton,
} from "@/features/travel/components/hero/hero-form-primitives";
import { useTranslation } from "@/hooks/use-translation";

type ToursSearchFormProps = {
  onSubmit: (fields: Record<string, string>) => void;
};

export function ToursSearchForm({ onSubmit }: ToursSearchFormProps) {
  const t = useTranslation();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(getDefaultCheckInDate());

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
        <HeroField
          icon={<MapPin className="h-4 w-4 shrink-0" />}
          placeholder={t("hero.location")}
          value={location}
          onChange={setLocation}
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
