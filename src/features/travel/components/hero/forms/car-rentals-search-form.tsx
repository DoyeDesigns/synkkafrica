"use client";

import { useState } from "react";
import { Car, ChevronDown, MapPin, Search } from "lucide-react";

import {
  HeroField,
  HeroInputShell,
  HeroSearchButton,
} from "@/features/travel/components/hero/hero-form-primitives";
import { useTranslation } from "@/hooks/use-translation";
import Image from "next/image";

type CarRentalsSearchFormProps = {
  onSubmit: (fields: Record<string, string>) => void;
};

const MAX_PRICE = 100000;

function formatHeroPrice(value: number) {
  return `NGN ${value.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function CarRentalsSearchForm({
  onSubmit,
}: CarRentalsSearchFormProps) {
  const t = useTranslation();
  const [maxPrice, setMaxPrice] = useState(50000);
  const sliderPercent = (maxPrice / MAX_PRICE) * 100;

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          carType: "",
          location: "",
          serviceType: "self-drive",
          maxPrice: String(maxPrice),
        });
      }}
    >
      <HeroInputShell>
        <HeroField
          icon={<Search className="h-4 w-4 shrink-0" />}
          placeholder={t("hero.carRentals.searchCarType")}
        />
        <HeroField
          icon={<MapPin className="h-4 w-4 shrink-0" />}
          placeholder={t("hero.location")}
        />
      </HeroInputShell>

      <HeroInputShell>
        <div className="flex w-full min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:items-center">
          <button
            type="button"
            className="inline-flex min-h-12 min-w-0 flex-3 items-center justify-between gap-2 rounded-xl bg-[#0000003D] px-4 text-sm font-medium text-white"
          >
            <span className="flex items-center gap-2">
              {/* <Car className="h-4 w-4 shrink-0" strokeWidth={1.75} /> */}
              <Image src="/wheel.png" alt="Car" width={20} height={20} />
              <span>{t("hero.carRentals.selfDrive")}</span>
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-white/80" />
          </button>

          <div className="flex min-h-12 min-w-0 flex-2 items-center gap-3 rounded-xl bg-[#0000003D] px-4 text-sm text-white">
            <span className="shrink-0 font-medium">{t("hero.carRentals.price")}</span>
            <input
              type="range"
              min={0}
              max={MAX_PRICE}
              step={1000}
              value={maxPrice}
              onChange={(event) => setMaxPrice(Number(event.target.value))}
              style={{
                background: `linear-gradient(to right, #e45d25 0%, #e45d25 ${sliderPercent}%, #ffffff ${sliderPercent}%, #ffffff 100%)`,
              }}
              className="hero-price-range h-1.5 w-full min-w-0 flex-1 cursor-pointer appearance-none rounded-full"
            />
          </div>

          <div className="flex min-h-12 shrink-0 items-center rounded-xl bg-[#0000003D] px-4 text-sm text-white/70">
            <span className="whitespace-nowrap font-medium">
              {formatHeroPrice(maxPrice)}
            </span>
          </div>

          <HeroSearchButton
            label={t("hero.search")}
            variant="blue"
            className="w-full shrink-0 rounded-lg lg:min-w-[181px] lg:w-auto"
          />
        </div>
      </HeroInputShell>
    </form>
  );
}
