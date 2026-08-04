"use client";

import { useMemo, useRef, useState } from "react";
import { Calendar, ChevronDown, Search } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

import { getDefaultCheckInDate } from "@/features/travel/booking/booking-params";
import {
  HeroField,
  HeroInputShell,
  HeroSearchButton,
} from "@/features/travel/components/hero/hero-form-primitives";
import { HeroDestinationField } from "@/features/travel/components/hero/hero-destination-field";
import { listCarDestinations } from "@/lib/api/cars";
import { useClickOutside } from "@/hooks/use-click-outside";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

type CarRentalsSearchFormProps = {
  onSubmit: (fields: Record<string, string>) => void;
};

const MAX_PRICE = 100000;
const DEFAULT_MAX_PRICE = 50000;
const SERVICE_TYPES = ["self-drive", "chauffeur"] as const;

const SERVICE_TYPE_LABEL_KEYS: Record<
  (typeof SERVICE_TYPES)[number],
  TranslationKey
> = {
  "self-drive": "hero.carRentals.selfDrive",
  chauffeur: "filters.serviceType.chauffeur",
};

function formatHeroPrice(value: number) {
  return `NGN ${value.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function parseMaxPrice(value: string | null) {
  if (!value) {
    return DEFAULT_MAX_PRICE;
  }

  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed)) {
    return DEFAULT_MAX_PRICE;
  }

  return Math.min(Math.max(parsed, 0), MAX_PRICE);
}

function getInitialServiceType(searchParams: URLSearchParams) {
  const serviceType = searchParams.get("serviceType");

  if (serviceType && SERVICE_TYPES.includes(serviceType as (typeof SERVICE_TYPES)[number])) {
    return serviceType as (typeof SERVICE_TYPES)[number];
  }

  return "self-drive" as const;
}

export function CarRentalsSearchForm({
  onSubmit,
}: CarRentalsSearchFormProps) {
  const t = useTranslation();
  const searchParams = useSearchParams();
  const [maxPrice, setMaxPrice] = useState(() =>
    parseMaxPrice(searchParams.get("maxPrice")),
  );
  const [carType, setCarType] = useState(
    () => searchParams.get("carType") ?? "",
  );
  const [location, setLocation] = useState(
    () => searchParams.get("location") ?? "",
  );
  const [pickupDate, setPickupDate] = useState(
    () => searchParams.get("date") ?? getDefaultCheckInDate(),
  );
  const [serviceType, setServiceType] = useState(() =>
    getInitialServiceType(searchParams),
  );
  const [serviceMenuOpen, setServiceMenuOpen] = useState(false);
  const serviceMenuRef = useRef<HTMLDivElement>(null);
  const sliderPercent = (maxPrice / MAX_PRICE) * 100;

  const serviceTypeOptions = useMemo(
    () =>
      SERVICE_TYPES.map((value) => ({
        value,
        label: t(SERVICE_TYPE_LABEL_KEYS[value]),
      })),
    [t],
  );

  const selectedServiceLabel =
    serviceTypeOptions.find((option) => option.value === serviceType)?.label ??
    t("hero.carRentals.selfDrive");

  useClickOutside(serviceMenuRef, () => setServiceMenuOpen(false), serviceMenuOpen);

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          carType: carType.trim(),
          location: location.trim(),
          serviceType,
          maxPrice: String(maxPrice),
          date: pickupDate,
        });
      }}
    >
      <HeroInputShell>
        <HeroField
          icon={<Search className="h-4 w-4 shrink-0" />}
          placeholder={t("hero.carRentals.searchCarType")}
          value={carType}
          onChange={setCarType}
        />
        <HeroDestinationField
          placeholder={t("hero.location")}
          value={location}
          onChange={setLocation}
          queryKey="car-destinations"
          fetchDestinations={listCarDestinations}
          countLabel={(count) =>
            t(
              count === 1
                ? "hero.carRentals.destinationCar"
                : "hero.carRentals.destinationCars",
              { count },
            )
          }
        />
        <HeroField
          icon={<Calendar className="h-4 w-4 shrink-0" />}
          placeholder={t("hero.carRentals.pickupDate")}
          value={pickupDate}
          onChange={setPickupDate}
          type="date"
          min={new Date().toISOString().split("T")[0]}
        />
      </HeroInputShell>

      <HeroInputShell>
        <div className="flex w-full min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:items-center">
          <div ref={serviceMenuRef} className="relative min-w-0 flex-3">
            <button
              type="button"
              aria-expanded={serviceMenuOpen}
              aria-haspopup="listbox"
              onClick={() => setServiceMenuOpen((current) => !current)}
              className="inline-flex min-h-12 w-full min-w-0 items-center justify-between gap-2 rounded-xl bg-[#0000003D] px-4 text-sm font-medium text-white"
            >
              <span className="flex items-center gap-2">
                <Image src="/wheel.png" alt="Car" width={20} height={20} />
                <span>{selectedServiceLabel}</span>
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-white/80 transition-transform ${
                  serviceMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {serviceMenuOpen ? (
              <ul
                role="listbox"
                aria-label={t("hero.carRentals.selfDrive")}
                className="absolute left-0 top-[calc(100%+0.5rem)] z-50 min-w-full overflow-hidden rounded-xl border border-[#E5E5E5] bg-white py-1 shadow-lg"
              >
                {serviceTypeOptions.map((option) => {
                  const isSelected = option.value === serviceType;

                  return (
                    <li key={option.value} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          setServiceType(option.value);
                          setServiceMenuOpen(false);
                        }}
                        className={`flex w-full px-4 py-2.5 text-left text-sm font-medium font-satoshi transition-colors ${
                          isSelected
                            ? "bg-[#E8F4FD] text-[#2F2F2F]"
                            : "text-[#2F2F2F] hover:bg-zinc-50"
                        }`}
                      >
                        {option.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>

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
