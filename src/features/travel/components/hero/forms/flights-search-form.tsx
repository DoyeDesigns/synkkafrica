"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeftRight, PlaneLanding, PlaneTakeoff, Plus, Trash2 } from "lucide-react";

import { getDefaultCheckInDate } from "@/features/travel/booking/booking-params";
import {
  HeroFormRow,
  HeroInputShell,
  HeroPillSelect,
  HeroRadioOption,
  HeroSearchButton,
} from "@/features/travel/components/hero/hero-form-primitives";
import { HeroAirportField } from "@/features/travel/components/hero/hero-airport-field";
import { HeroDateRangeField } from "@/features/travel/components/hero/hero-date-range-field";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

type FlightsSearchFormProps = {
  onSubmit: (fields: Record<string, string>) => void;
};

type TripType = "round-trip" | "one-way" | "multi-city";
type FlightLeg = { from: string; to: string; date: string };

const TRIP_TYPES: TripType[] = ["round-trip", "one-way", "multi-city"];
const CABIN_CLASSES = ["economy", "premium-economy", "business", "first"] as const;
const PASSENGER_COUNTS = ["1", "2", "3", "4", "5", "6", "7", "8"] as const;
const MAX_LEGS = 5;

const TRIP_TYPE_LABEL_KEYS: Record<TripType, TranslationKey> = {
  "round-trip": "hero.flights.roundTrip",
  "one-way": "hero.flights.oneWay",
  "multi-city": "hero.flights.multiCity",
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

function parseTripType(value: string | null): TripType {
  if (value === "one-way" || value === "multi-city") return value;
  return "round-trip";
}

function emptyLeg(from = "", date = ""): FlightLeg {
  return { from, to: "", date };
}

function getInitialExtraLegs(searchParams: URLSearchParams): FlightLeg[] {
  const extra: FlightLeg[] = [];

  for (let index = 2; index <= MAX_LEGS; index += 1) {
    const from = searchParams.get(`from${index}`) ?? "";
    const to = searchParams.get(`to${index}`) ?? "";
    const date = searchParams.get(`departureDate${index}`) ?? "";
    if (!from && !to && !date) break;
    extra.push({ from, to, date });
  }

  return extra;
}

type FlightRouteRowProps = {
  from: string;
  to: string;
  date: string;
  returnDate?: string;
  showReturnDate?: boolean;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onReturnDateChange?: (value: string) => void;
  onRemove?: () => void;
  showSearch?: boolean;
  routeKey: string;
  fromPlaceholder: string;
  toPlaceholder: string;
  departingLabel: string;
  returningLabel: string;
  addDateLabel: string;
  searchLabel: string;
  removeLabel: string;
};

function FlightRouteRow({
  from,
  to,
  date,
  returnDate = "",
  showReturnDate = false,
  onFromChange,
  onToChange,
  onDateChange,
  onReturnDateChange,
  onRemove,
  showSearch = false,
  routeKey,
  fromPlaceholder,
  toPlaceholder,
  departingLabel,
  returningLabel,
  addDateLabel,
  searchLabel,
  removeLabel,
}: FlightRouteRowProps) {
  const [routeNonce, setRouteNonce] = useState(0);
  const [swapSpinning, setSwapSpinning] = useState(false);

  const handleSwapAirports = () => {
    onFromChange(to);
    onToChange(from);
    setRouteNonce((key) => key + 1);
    setSwapSpinning(true);
    window.setTimeout(() => setSwapSpinning(false), 350);
  };

  return (
    <HeroInputShell>
      <HeroAirportField
        key={`${routeKey}-from-${routeNonce}`}
        placeholder={fromPlaceholder}
        value={from}
        onChange={onFromChange}
        listboxId={`${routeKey}-from-listbox`}
        icon={PlaneTakeoff}
        className="w-full min-w-0 lg:!flex-[0.8] lg:!max-w-[170px]"
      />
      <button
        type="button"
        onClick={handleSwapAirports}
        aria-label="Swap origin and destination"
        className="mx-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/25 bg-[#0000003D] text-white transition-colors hover:bg-white/15 lg:mx-0"
      >
        <ArrowLeftRight
          className={`h-4 w-4 transition-transform duration-300 ${
            swapSpinning ? "rotate-180" : "rotate-0"
          }`}
          strokeWidth={2}
        />
      </button>
      <HeroAirportField
        key={`${routeKey}-to-${routeNonce}`}
        placeholder={toPlaceholder}
        value={to}
        onChange={onToChange}
        listboxId={`${routeKey}-to-listbox`}
        icon={PlaneLanding}
        className="w-full min-w-0 lg:!flex-[0.8] lg:!max-w-[170px]"
      />
      <HeroDateRangeField
        fromLabel={departingLabel}
        toLabel={returningLabel}
        addDateLabel={addDateLabel}
        fromDate={date}
        toDate={returnDate}
        onFromDateChange={onDateChange}
        onToDateChange={onReturnDateChange ?? (() => undefined)}
        showToDate={showReturnDate}
        className="w-full min-w-0 lg:!flex-[1.9]"
      />
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel}
          className="mx-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/25 bg-[#0000003D] text-white transition-colors hover:bg-white/15 lg:mx-0"
        >
          <Trash2 className="h-4 w-4" strokeWidth={2} />
        </button>
      ) : null}
      {showSearch ? (
        <HeroSearchButton
          label={searchLabel}
          variant="blue"
          className="w-full shrink-0 lg:w-auto"
        />
      ) : null}
    </HeroInputShell>
  );
}

export function FlightsSearchForm({ onSubmit }: FlightsSearchFormProps) {
  const t = useTranslation();
  const searchParams = useSearchParams();
  const [tripType, setTripType] = useState<TripType>(() =>
    parseTripType(searchParams.get("tripType")),
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
  const [extraLegs, setExtraLegs] = useState<FlightLeg[]>(() => {
    if (parseTripType(searchParams.get("tripType")) !== "multi-city") {
      return [emptyLeg(searchParams.get("to") ?? "")];
    }

    const parsed = getInitialExtraLegs(searchParams);
    return parsed.length > 0
      ? parsed
      : [emptyLeg(searchParams.get("to") ?? "", searchParams.get("departureDate") ?? "")];
  });

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

  const isMultiCity = tripType === "multi-city";
  const showReturnDate = tripType === "round-trip";
  const canAddLeg = extraLegs.length + 1 < MAX_LEGS;
  const canRemoveLeg = extraLegs.length > 1;

  const handleTripTypeChange = (nextTripType: TripType) => {
    setTripType(nextTripType);

    if (nextTripType === "one-way" || nextTripType === "multi-city") {
      setReturnDate("");
    }

    if (nextTripType === "multi-city") {
      setExtraLegs((current) => {
        const hasValues = current.some((leg) => leg.from || leg.to || leg.date);
        return hasValues ? current : [emptyLeg(to, departureDate)];
      });
    }
  };

  const updateExtraLeg = (index: number, patch: Partial<FlightLeg>) => {
    setExtraLegs((current) =>
      current.map((leg, legIndex) =>
        legIndex === index ? { ...leg, ...patch } : leg,
      ),
    );
  };

  const handleAddLeg = () => {
    if (!canAddLeg) return;
    const previous = extraLegs[extraLegs.length - 1];
    setExtraLegs((current) => [
      ...current,
      emptyLeg(previous?.to || to, previous?.date || departureDate),
    ]);
  };

  const handleRemoveLeg = (index: number) => {
    if (!canRemoveLeg) return;
    setExtraLegs((current) => current.filter((_, legIndex) => legIndex !== index));
  };

  const searchLabel = t("hero.accommodations.checkAvailability");
  const fromPlaceholder = t("hero.flights.fromCity");
  const toPlaceholder = t("hero.flights.toCity");
  const departingLabel = t("hero.flights.departing");
  const returningLabel = t("hero.flights.returning");
  const addDateLabel = t("hero.common.addDate");
  const removeLabel = t("hero.flights.removeFlight");

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const fields: Record<string, string> = {
          tripType,
          cabinClass,
          passengers,
          from: from.trim(),
          to: to.trim(),
          departureDate,
        };

        if (showReturnDate && returnDate) {
          fields.returnDate = returnDate;
        }

        if (isMultiCity) {
          extraLegs.forEach((leg, index) => {
            const n = index + 2;
            if (leg.from.trim()) fields[`from${n}`] = leg.from.trim();
            if (leg.to.trim()) fields[`to${n}`] = leg.to.trim();
            if (leg.date) fields[`departureDate${n}`] = leg.date;
          });
        }

        onSubmit(fields);
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

      <FlightRouteRow
        from={from}
        to={to}
        date={departureDate}
        returnDate={returnDate}
        showReturnDate={showReturnDate}
        onFromChange={setFrom}
        onToChange={setTo}
        onDateChange={setDepartureDate}
        onReturnDateChange={setReturnDate}
        showSearch={!isMultiCity}
        routeKey="hero-flight-leg-1"
        fromPlaceholder={fromPlaceholder}
        toPlaceholder={toPlaceholder}
        departingLabel={departingLabel}
        returningLabel={returningLabel}
        addDateLabel={addDateLabel}
        searchLabel={searchLabel}
        removeLabel={removeLabel}
      />

      {isMultiCity
        ? extraLegs.map((leg, index) => (
            <FlightRouteRow
              key={`extra-leg-${index}`}
              from={leg.from}
              to={leg.to}
              date={leg.date}
              onFromChange={(value) => updateExtraLeg(index, { from: value })}
              onToChange={(value) => updateExtraLeg(index, { to: value })}
              onDateChange={(value) => updateExtraLeg(index, { date: value })}
              onRemove={canRemoveLeg ? () => handleRemoveLeg(index) : undefined}
              showSearch={index === extraLegs.length - 1}
              routeKey={`hero-flight-leg-${index + 2}`}
              fromPlaceholder={fromPlaceholder}
              toPlaceholder={toPlaceholder}
              departingLabel={departingLabel}
              returningLabel={returningLabel}
              addDateLabel={addDateLabel}
              searchLabel={searchLabel}
              removeLabel={removeLabel}
            />
          ))
        : null}

      {isMultiCity && canAddLeg ? (
        <button
          type="button"
          onClick={handleAddLeg}
          className="inline-flex items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          {t("hero.flights.addFlight")}
        </button>
      ) : null}
    </form>
  );
}
