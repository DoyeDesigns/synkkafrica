"use client";

import { MapPin, Search } from "lucide-react";

import {
  HeroField,
  HeroInputShell,
  HeroSearchButton,
} from "@/features/travel/components/hero/hero-form-primitives";

type ToursSearchFormProps = {
  onSubmit: (fields: Record<string, string>) => void;
};

export function ToursSearchForm({ onSubmit }: ToursSearchFormProps) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          query: "",
          location: "",
        });
      }}
    >
      <HeroInputShell>
        <HeroField
          icon={<Search className="h-4 w-4 shrink-0" />}
          placeholder="Search Locations, attractions & experiences"
        />
        <HeroField
          icon={<MapPin className="h-4 w-4 shrink-0" />}
          placeholder="Location"
        />
        <HeroSearchButton label="Search" variant="blue" className="rounded-lg" />
      </HeroInputShell>
    </form>
  );
}
