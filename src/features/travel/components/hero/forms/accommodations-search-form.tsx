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
          label="Property type"
          icon={<Building2 className="h-4 w-4" />}
        />
        <div className="flex items-center gap-2">
        <HeroPillSelect label="1 Room" />
        <HeroPillSelect label="1 Guest" />
        </div>
      </HeroFormRow>

      <HeroInputShell>
        <HeroField
          icon={<MapPin className="h-4 w-4 shrink-0" />}
          placeholder="Your Destination"
        />
        <HeroField
          icon={<Calendar className="h-4 w-4 shrink-0" />}
          placeholder="Check In Date"
        />
        <HeroField
          icon={<Calendar className="h-4 w-4 shrink-0" />}
          placeholder="Check In Date"
        />
        <HeroSearchButton label="Check Availability" variant="coral" />
      </HeroInputShell>
    </form>
  );
}
