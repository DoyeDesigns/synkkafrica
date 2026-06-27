"use client";

import { MapPin, Search } from "lucide-react";

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
          placeholder={t("hero.tours.searchPlaceholder")}
        />
        <HeroField
          icon={<MapPin className="h-4 w-4 shrink-0" />}
          placeholder={t("hero.location")}
        />
        <HeroSearchButton label={t("hero.search")} variant="blue" className="rounded-lg" />
      </HeroInputShell>
    </form>
  );
}
