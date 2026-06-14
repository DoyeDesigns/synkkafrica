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

type FlightsSearchFormProps = {
  onSubmit: (fields: Record<string, string>) => void;
};

export function FlightsSearchForm({ onSubmit }: FlightsSearchFormProps) {
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
          <HeroRadioOption label="Round Trip" selected />
          <HeroRadioOption label="One-way" />
          <HeroRadioOption label="Direct Flight" />
        </div>
        <div className="flex flex-wrap items-center gap-3 lg:ml-auto">
          <HeroPillSelect label="Economy Class" />
          <HeroPillSelect label="1 Passenger" />
        </div>
      </HeroFormRow>

      <HeroInputShell>
        <HeroField
          icon={<MapPin className="h-4 w-4 shrink-0" />}
          placeholder="From | Select City"
        />
        <HeroField
          icon={<MapPin className="h-4 w-4 shrink-0" />}
          placeholder="To | Select City"
        />
        <HeroField
          icon={<Calendar className="h-4 w-4 shrink-0" />}
          placeholder="Departure date"
        />
        <HeroField
          icon={<Calendar className="h-4 w-4 shrink-0" />}
          placeholder="Return date"
        />
        <HeroSearchButton label="Check Availability" variant="blue" />
      </HeroInputShell>
    </form>
  );
}
