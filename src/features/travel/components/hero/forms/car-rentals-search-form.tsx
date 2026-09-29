"use client";

import { useMemo, useState } from "react";
import { Car, Plane, Users } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { HeroAirportField } from "@/features/travel/components/hero/hero-airport-field";
import { HeroDateRangeField } from "@/features/travel/components/hero/hero-date-range-field";
import { HeroDestinationField } from "@/features/travel/components/hero/hero-destination-field";
import {
  HeroField,
  HeroGlassSelect,
  HeroInputShell,
  HeroSearchButton,
  HeroTimeField,
} from "@/features/travel/components/hero/hero-form-primitives";
import { useTranslation } from "@/hooks/use-translation";
import { listCarDestinations } from "@/lib/api/cars";
import { searchCityFromLocation } from "@/lib/geo/city-supplements";
import type { TranslationKey } from "@/lib/preferences/translations";

type CarRentalsSearchFormProps = {
  onSubmit: (fields: Record<string, string>) => void;
};

const RENTAL_MODES = ["airport-transport", "daily-rental"] as const;
const TRIP_KINDS = ["arrival", "takeoff"] as const;

type RentalMode = (typeof RENTAL_MODES)[number];
type TripKind = (typeof TRIP_KINDS)[number];

const RENTAL_MODE_LABEL_KEYS: Record<RentalMode, TranslationKey> = {
  "airport-transport": "hero.carRentals.airportTransport",
  "daily-rental": "hero.carRentals.dailyRental",
};

const TRIP_KIND_LABEL_KEYS: Record<TripKind, TranslationKey> = {
  arrival: "hero.carRentals.flightArrival",
  takeoff: "hero.carRentals.flightTakeoff",
};

function pickParam<T extends string>(
  value: string | null,
  allowed: readonly T[],
  fallback: T,
): T {
  if (value && allowed.includes(value as T)) {
    return value as T;
  }

  return fallback;
}

function resolveRentalMode(value: string | null): RentalMode {
  if (value === "daily-rental") return "daily-rental";
  return "airport-transport";
}

export function CarRentalsSearchForm({
  onSubmit,
}: CarRentalsSearchFormProps) {
  const t = useTranslation();
  const searchParams = useSearchParams();
  const [rentalMode, setRentalMode] = useState<RentalMode>(() =>
    resolveRentalMode(searchParams.get("rentalMode")),
  );
  const [tripKind, setTripKind] = useState<TripKind>(() =>
    pickParam(searchParams.get("tripKind"), TRIP_KINDS, "arrival"),
  );
  const [airport, setAirport] = useState(
    () => searchParams.get("airport") ?? "",
  );
  const [destination, setDestination] = useState(() => {
    const value = searchParams.get("location") ?? "";
    return searchCityFromLocation(value) || value;
  });
  const [pickupDate, setPickupDate] = useState(
    () => searchParams.get("date") ?? "",
  );
  const [pickupTime, setPickupTime] = useState(
    () => searchParams.get("time") ?? "",
  );
  const [passengers, setPassengers] = useState(
    () => searchParams.get("passengers") ?? "",
  );

  const rentalModeOptions = useMemo(
    () =>
      RENTAL_MODES.map((value) => ({
        value,
        label: t(RENTAL_MODE_LABEL_KEYS[value]),
      })),
    [t],
  );

  const tripKindOptions = useMemo(
    () =>
      TRIP_KINDS.map((value) => ({
        value,
        label: t(TRIP_KIND_LABEL_KEYS[value]),
      })),
    [t],
  );

  const isAirport = rentalMode === "airport-transport";
  const isArrival = tripKind === "arrival";

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const location =
          searchCityFromLocation(destination.trim()) || destination.trim();

        onSubmit({
          rentalMode,
          tripKind: isAirport ? tripKind : "",
          airport: isAirport ? airport.trim() : "",
          location,
          date: pickupDate,
          time: pickupTime,
          passengers: isAirport ? passengers.trim() || "1" : "",
        });
      }}
    >
      <HeroInputShell>
        <HeroGlassSelect
          label={t("hero.carRentals.airportTransport")}
          value={rentalMode}
          options={rentalModeOptions}
          onChange={(value) =>
            setRentalMode(resolveRentalMode(value))
          }
          icon={<Car className="h-4 w-4 shrink-0" />}
        />
        {isAirport ? (
          <HeroGlassSelect
            label={t("hero.carRentals.flightArrival")}
            value={tripKind}
            options={tripKindOptions}
            onChange={(value) =>
              setTripKind(pickParam(value, TRIP_KINDS, "arrival"))
            }
            icon={<Plane className="h-4 w-4 shrink-0" />}
          />
        ) : null}
      </HeroInputShell>

      {isAirport ? (
        <>
          <HeroInputShell>
            <HeroAirportField
              placeholder={t("hero.carRentals.airport")}
              value={airport}
              onChange={setAirport}
              listboxId="car-rental-airport-listbox"
            />
            <HeroDestinationField
              placeholder={t("hero.carRentals.destinationLocation")}
              value={destination}
              onChange={setDestination}
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
              listboxId="car-rental-destination-listbox"
            />
          </HeroInputShell>
          <HeroInputShell>
            <HeroDateRangeField
              fromLabel={
                isArrival
                  ? t("hero.carRentals.flightArrivalDate")
                  : t("hero.carRentals.flightTakeoffDate")
              }
              toLabel=""
              addDateLabel={t("hero.common.addDate")}
              fromDate={pickupDate}
              toDate=""
              onFromDateChange={setPickupDate}
              onToDateChange={() => undefined}
              showToDate={false}
            />
            <HeroTimeField
              label={
                isArrival
                  ? t("hero.carRentals.flightArrivalTime")
                  : t("hero.carRentals.flightTakeoffTime")
              }
              value={pickupTime}
              onChange={setPickupTime}
            />
            <HeroField
              type="number"
              min="1"
              placeholder={t("hero.carRentals.passengers")}
              value={passengers}
              onChange={setPassengers}
              icon={<Users className="h-4 w-4 shrink-0" />}
            />
            <HeroSearchButton
              label={t("hero.search")}
              variant="blue"
              className="w-full shrink-0 rounded-lg lg:min-w-[140px] lg:w-auto"
            />
          </HeroInputShell>
        </>
      ) : (
        <HeroInputShell>
          <HeroDestinationField
            placeholder={t("hero.carRentals.pickupLocation")}
            value={destination}
            onChange={setDestination}
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
            listboxId="car-rental-pickup-listbox"
          />
          <HeroDateRangeField
            fromLabel={t("hero.carRentals.pickupDate")}
            toLabel=""
            addDateLabel={t("hero.common.addDate")}
            fromDate={pickupDate}
            toDate=""
            onFromDateChange={setPickupDate}
            onToDateChange={() => undefined}
            showToDate={false}
          />
          <HeroTimeField
            label={t("hero.carRentals.pickupTime")}
            value={pickupTime}
            onChange={setPickupTime}
          />
          <HeroSearchButton
            label={t("hero.search")}
            variant="blue"
            className="w-full shrink-0 rounded-lg lg:min-w-[140px] lg:w-auto"
          />
        </HeroInputShell>
      )}
    </form>
  );
}
