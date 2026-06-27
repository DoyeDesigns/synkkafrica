"use client";

import { Calendar, MapPin } from "lucide-react";

import {
  HeroField,
  HeroFormRow,
  HeroInputShell,
  HeroPillSelect,
  HeroRadioOption,
  HeroSearchButton,
} from "@/features/travel/components/hero/hero-form-primitives";
import { useTranslation } from "@/hooks/use-translation";

type FlightsSearchFormProps = {
  onSubmit: (fields: Record<string, string>) => void;
};

export function FlightsSearchForm({ onSubmit }: FlightsSearchFormProps) {
  const t = useTranslation();

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          tripType: "round-trip",
          cabinClass: "economy",
          passengers: "1",
          from: "",
          to: "",
          departureDate: "",
          returnDate: "",
        });
      }}
    >
      <HeroFormRow>
        <div className="flex flex-wrap items-center gap-3">
          <HeroRadioOption label={t("hero.flights.roundTrip")} selected />
          <HeroRadioOption label={t("hero.flights.oneWay")} />
          <HeroRadioOption label={t("hero.flights.directFlight")} />
        </div>
        <div className="flex flex-wrap items-center gap-3 lg:ml-auto">
          <HeroPillSelect label={t("hero.flights.economyClass")} />
          <HeroPillSelect label={t("hero.flights.onePassenger")} />
        </div>
      </HeroFormRow>

      <HeroInputShell>
        <HeroField
          icon={<MapPin className="h-4 w-4 shrink-0" />}
          placeholder={t("hero.flights.fromCity")}
        />
        <HeroField
          icon={<MapPin className="h-4 w-4 shrink-0" />}
          placeholder={t("hero.flights.toCity")}
        />
        <HeroField
          icon={<Calendar className="h-4 w-4 shrink-0" />}
          placeholder={t("hero.flights.departureDate")}
        />
        <HeroField
          icon={<Calendar className="h-4 w-4 shrink-0" />}
          placeholder={t("hero.flights.returnDate")}
        />
        <HeroSearchButton label={t("hero.accommodations.checkAvailability")} variant="blue" />
      </HeroInputShell>
    </form>
  );
}
