"use client";

import { Calendar, MapPin } from "lucide-react";
import { useState } from "react";

import { getDefaultCheckInDate } from "@/features/travel/booking/booking-params";
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
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departureDate, setDepartureDate] = useState(getDefaultCheckInDate());
  const [returnDate, setReturnDate] = useState("");

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          tripType: "round-trip",
          cabinClass: "economy",
          passengers: "1",
          from: from.trim(),
          to: to.trim(),
          departureDate,
          returnDate,
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
          value={from}
          onChange={setFrom}
        />
        <HeroField
          icon={<MapPin className="h-4 w-4 shrink-0" />}
          placeholder={t("hero.flights.toCity")}
          value={to}
          onChange={setTo}
        />
        <HeroField
          icon={<Calendar className="h-4 w-4 shrink-0" />}
          placeholder={t("hero.flights.departureDate")}
          value={departureDate}
          onChange={setDepartureDate}
          type="date"
          min={new Date().toISOString().split("T")[0]}
        />
        <HeroField
          icon={<Calendar className="h-4 w-4 shrink-0" />}
          placeholder={t("hero.flights.returnDate")}
          value={returnDate}
          onChange={setReturnDate}
          type="date"
          min={departureDate || new Date().toISOString().split("T")[0]}
        />
        <HeroSearchButton label={t("hero.accommodations.checkAvailability")} variant="blue" />
      </HeroInputShell>
    </form>
  );
}
