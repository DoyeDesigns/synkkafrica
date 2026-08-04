"use client";

import { MapPin } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { getDefaultCheckInDate } from "@/features/travel/booking/booking-params";
import {
  HeroField,
  HeroFormRow,
  HeroInputShell,
  HeroPillSelect,
  HeroRadioOption,
  HeroSearchButton,
} from "@/features/travel/components/hero/hero-form-primitives";
import { HeroDateRangeField } from "@/features/travel/components/hero/hero-date-range-field";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

type FlightsSearchFormProps = {
  onSubmit: (fields: Record<string, string>) => void;
};

type TripType = "round-trip" | "one-way" | "direct";

const TRIP_TYPES: TripType[] = ["round-trip", "one-way", "direct"];
const CABIN_CLASSES = ["economy", "premium-economy", "business", "first"] as const;
const PASSENGER_COUNTS = ["1", "2", "3", "4", "5", "6", "7", "8"] as const;

const TRIP_TYPE_LABEL_KEYS: Record<TripType, TranslationKey> = {
  "round-trip": "hero.flights.roundTrip",
  "one-way": "hero.flights.oneWay",
  direct: "hero.flights.directFlight",
};

const CABIN_CLASS_LABEL_KEYS: Record<
  (typeof CABIN_CLASSES)[number],
  TranslationKey
> = {
  economy: "hero.flights.economyClass",
  "premium-economy": "hero.flights.premiumEconomyClass",
  business: "hero.flights.businessClass",
  first: "hero.flights.firstClass",
};

function getCountLabel(
  count: string,
  singularKey: TranslationKey,
  pluralKey: TranslationKey,
  t: (key: TranslationKey, params?: Record<string, string | number>) => string,
) {
  const value = Number(count);

  if (value === 1) {
    return t(singularKey);
  }

  return t(pluralKey, { count: value });
}

function getInitialTripType(searchParams: URLSearchParams): TripType {
  const tripType = searchParams.get("tripType");

  if (tripType && TRIP_TYPES.includes(tripType as TripType)) {
    return tripType as TripType;
  }

  return "round-trip";
}

export function FlightsSearchForm({ onSubmit }: FlightsSearchFormProps) {
  const t = useTranslation();
  const searchParams = useSearchParams();
  const [tripType, setTripType] = useState<TripType>(() =>
    getInitialTripType(searchParams),
  );
  const [cabinClass, setCabinClass] = useState(
    () => searchParams.get("cabinClass") ?? "economy",
  );
  const [passengers, setPassengers] = useState(
    () => searchParams.get("passengers") ?? "1",
  );
  const [from, setFrom] = useState(() => searchParams.get("from") ?? "");
  const [to, setTo] = useState(() => searchParams.get("to") ?? "");
  const [departureDate, setDepartureDate] = useState(
    () => searchParams.get("departureDate") ?? getDefaultCheckInDate(),
  );
  const [returnDate, setReturnDate] = useState(
    () => searchParams.get("returnDate") ?? "",
  );

  const cabinClassOptions = useMemo(
    () =>
      CABIN_CLASSES.map((value) => ({
        value,
        label: t(CABIN_CLASS_LABEL_KEYS[value]),
      })),
    [t],
  );

  const passengerOptions = useMemo(
    () =>
      PASSENGER_COUNTS.map((count) => ({
        value: count,
        label: getCountLabel(
          count,
          "hero.flights.onePassenger",
          "hero.flights.passengersCount",
          t,
        ),
      })),
    [t],
  );

  const showReturnDate = tripType !== "one-way";

  const handleTripTypeChange = (nextTripType: TripType) => {
    setTripType(nextTripType);

    if (nextTripType === "one-way") {
      setReturnDate("");
    }
  };

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          tripType,
          cabinClass,
          passengers,
          from: from.trim(),
          to: to.trim(),
          departureDate,
          ...(showReturnDate && returnDate ? { returnDate } : {}),
        });
      }}
    >
      <HeroFormRow>
        <div className="flex flex-wrap items-center gap-3">
          {TRIP_TYPES.map((value) => (
            <HeroRadioOption
              key={value}
              label={t(TRIP_TYPE_LABEL_KEYS[value])}
              selected={tripType === value}
              onSelect={() => handleTripTypeChange(value)}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3 lg:ml-auto">
          <HeroPillSelect
            label={t("hero.flights.economyClass")}
            options={cabinClassOptions}
            value={cabinClass}
            onChange={setCabinClass}
          />
          <HeroPillSelect
            label={t("hero.flights.onePassenger")}
            options={passengerOptions}
            value={passengers}
            onChange={setPassengers}
          />
        </div>
      </HeroFormRow>

      <HeroInputShell>
        <HeroField
          icon={<MapPin className="h-4 w-4 shrink-0" />}
          placeholder={t("hero.flights.fromCity")}
          value={from}
          onChange={setFrom}
          className="w-full min-w-0 lg:!flex-[0.8] lg:!max-w-[170px]"
        />
        <HeroField
          icon={<MapPin className="h-4 w-4 shrink-0" />}
          placeholder={t("hero.flights.toCity")}
          value={to}
          onChange={setTo}
          className="w-full min-w-0 lg:!flex-[0.8] lg:!max-w-[170px]"
        />
        <HeroDateRangeField
          fromLabel={t("hero.flights.departing")}
          toLabel={t("hero.flights.returning")}
          addDateLabel={t("hero.common.addDate")}
          fromDate={departureDate}
          toDate={returnDate}
          onFromDateChange={setDepartureDate}
          onToDateChange={setReturnDate}
          showToDate={showReturnDate}
          className="w-full min-w-0 lg:!flex-[1.9]"
        />
        <HeroSearchButton
          label={t("hero.accommodations.checkAvailability")}
          variant="blue"
          className="w-full shrink-0 lg:w-auto"
        />
      </HeroInputShell>
    </form>
  );
}
