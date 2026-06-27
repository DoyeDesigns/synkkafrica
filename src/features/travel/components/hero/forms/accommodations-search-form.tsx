"use client";

import {
  Building2,
  Calendar,
  Car,
  ChevronDown,
  MapPin,
  Search,
} from "lucide-react";

import {
  HeroField,
  HeroFormRow,
  HeroInputShell,
  HeroPillSelect,
  HeroSearchButton,
} from "@/features/travel/components/hero/hero-form-primitives";
import { useTranslation } from "@/hooks/use-translation";

type AccommodationsSearchFormProps = {
  onSubmit: (fields: Record<string, string>) => void;
};

/**
 * @reference-form
 * FORM_REFERENCE_SECTION = "accommodations"
 * When you say "sync forms from reference", copy styling/structure
 * from THIS file into flights, car-rentals, and tours search forms.
 */
export function AccommodationsSearchForm({
  onSubmit,
}: AccommodationsSearchFormProps) {
  const t = useTranslation();

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          propertyType: "property",
          rooms: "1",
          guests: "1",
          destination: "",
          checkIn: "",
          checkOut: "",
        });
      }}
    >
      <HeroFormRow>
      <HeroPillSelect
          label={t("hero.accommodations.propertyType")}
          icon={<Building2 className="h-4 w-4" />}
        />
        <div className="flex items-center gap-2">
        <HeroPillSelect label={t("hero.accommodations.oneRoom")} />
        <HeroPillSelect label={t("hero.accommodations.oneGuest")} />
        </div>
      </HeroFormRow>

      <HeroInputShell>
        <HeroField
          icon={<MapPin className="h-4 w-4 shrink-0" />}
          placeholder={t("hero.accommodations.destination")}
        />
        <HeroField
          icon={<Calendar className="h-4 w-4 shrink-0" />}
          placeholder={t("hero.accommodations.checkIn")}
        />
        <HeroField
          icon={<Calendar className="h-4 w-4 shrink-0" />}
          placeholder={t("hero.accommodations.checkIn")}
        />
        <HeroSearchButton label={t("hero.accommodations.checkAvailability")} variant="coral" />
      </HeroInputShell>
    </form>
  );
}
