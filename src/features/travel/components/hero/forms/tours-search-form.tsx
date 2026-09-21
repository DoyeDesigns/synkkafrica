"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

import { getDefaultCheckInDate } from "@/features/travel/booking/booking-params";
import { HeroAddressField } from "@/features/travel/components/hero/hero-address-field";
import {
  HeroField,
  HeroInputShell,
  HeroSearchButton,
} from "@/features/travel/components/hero/hero-form-primitives";
import { HeroDateRangeField } from "@/features/travel/components/hero/hero-date-range-field";
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
        <HeroAddressField
          placeholder={t("hero.location")}
          value={location}
          onChange={setLocation}
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
