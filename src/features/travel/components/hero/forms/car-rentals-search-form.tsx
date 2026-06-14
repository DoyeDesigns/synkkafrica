"use client";

import { Car, MapPin, Search } from "lucide-react";

import {
  HeroField,
  HeroFormRow,
  HeroInputShell,
  HeroPillSelect,
  HeroSearchButton,
} from "@/features/travel/components/hero/hero-form-primitives";

type CarRentalsSearchFormProps = {
  onSubmit: (fields: Record<string, string>) => void;
};

export function CarRentalsSearchForm({
  onSubmit,
}: CarRentalsSearchFormProps) {
  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          carType: "",
          location: "",
          serviceType: "self-drive",
          maxPrice: "50000",
        });
      }}
    >
      <HeroInputShell>
        <HeroField
          icon={<Search className="h-4 w-4 shrink-0" />}
          placeholder="Search Car type"
        />
        <HeroField
          icon={<MapPin className="h-4 w-4 shrink-0" />}
          placeholder="Location"
        />
      </HeroInputShell>

      <HeroFormRow>
        <HeroPillSelect
          label="Self drive"
          icon={<Car className="h-4 w-4" />}
          className="rounded-xl"
        />

        <div className="flex flex-1 items-center gap-3 rounded-full border border-white/70 px-4 py-2 text-sm text-white">
          <span>₦ Price</span>
          <input
            type="range"
            min={0}
            max={100000}
            defaultValue={50000}
            className="h-1 flex-1 cursor-pointer accent-[#e45d25]"
          />
          <span className="whitespace-nowrap text-xs">NGN 50,000.00</span>
        </div>

        <HeroSearchButton label="Search" variant="blue" className="rounded-lg" />
      </HeroFormRow>
    </form>
  );
}
