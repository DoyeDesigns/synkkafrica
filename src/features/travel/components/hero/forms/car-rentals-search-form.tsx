"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Car, MapPin } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

import { getDefaultCheckInDate } from "@/features/travel/booking/booking-params";
import { HeroAddressField } from "@/features/travel/components/hero/hero-address-field";
import { HeroDateRangeField } from "@/features/travel/components/hero/hero-date-range-field";
import {
  HeroGlassSelect,
  HeroInputShell,
  HeroSearchButton,
} from "@/features/travel/components/hero/hero-form-primitives";
import { useTranslation } from "@/hooks/use-translation";
import { reverseGeocode } from "@/lib/api/places";
import type { TranslationKey } from "@/lib/preferences/translations";

type CarRentalsSearchFormProps = {
  onSubmit: (fields: Record<string, string>) => void;
};

const RENTAL_MODES = ["pickup-dropoff", "daily-rental"] as const;
const LOCATION_KINDS = ["pickup", "dropoff"] as const;
const SERVICE_TYPES = ["chauffeur", "self-drive"] as const;

type RentalMode = (typeof RENTAL_MODES)[number];
type LocationKind = (typeof LOCATION_KINDS)[number];
type ServiceType = (typeof SERVICE_TYPES)[number];

const RENTAL_MODE_LABEL_KEYS: Record<RentalMode, TranslationKey> = {
  "pickup-dropoff": "hero.carRentals.pickupAndDropoff",
  "daily-rental": "hero.carRentals.dailyRental",
};

const LOCATION_KIND_LABEL_KEYS: Record<LocationKind, TranslationKey> = {
  pickup: "hero.carRentals.pickup",
  dropoff: "hero.carRentals.dropoff",
};

const SERVICE_TYPE_LABEL_KEYS: Record<ServiceType, TranslationKey> = {
  chauffeur: "filters.serviceType.chauffeur",
  "self-drive": "hero.carRentals.selfDrive",
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

export function CarRentalsSearchForm({
  onSubmit,
}: CarRentalsSearchFormProps) {
  const t = useTranslation();
  const searchParams = useSearchParams();
  const [rentalMode, setRentalMode] = useState<RentalMode>(() =>
    pickParam(searchParams.get("rentalMode"), RENTAL_MODES, "pickup-dropoff"),
  );
  const [locationKind, setLocationKind] = useState<LocationKind>(() =>
    pickParam(searchParams.get("locationKind"), LOCATION_KINDS, "pickup"),
  );
  const [pickupAddress, setPickupAddress] = useState(
    () => searchParams.get("location") ?? "",
  );
  const [dropoffAddress, setDropoffAddress] = useState(
    () => searchParams.get("dropoffLocation") ?? "",
  );
  const [pickupDate, setPickupDate] = useState(
    () => searchParams.get("date") ?? getDefaultCheckInDate(),
  );
  const [serviceType, setServiceType] = useState<ServiceType>(() =>
    pickParam(searchParams.get("serviceType"), SERVICE_TYPES, "chauffeur"),
  );
  const [detectingLocation, setDetectingLocation] = useState(false);
  const locatingRef = useRef(false);
  const didAutoFillOnMount = useRef(false);

  const rentalModeOptions = useMemo(
    () =>
      RENTAL_MODES.map((value) => ({
        value,
        label: t(RENTAL_MODE_LABEL_KEYS[value]),
      })),
    [t],
  );

  const locationKindOptions = useMemo(
    () =>
      LOCATION_KINDS.map((value) => ({
        value,
        label: t(LOCATION_KIND_LABEL_KEYS[value]),
      })),
    [t],
  );

  const serviceTypeOptions = useMemo(
    () =>
      SERVICE_TYPES.map((value) => ({
        value,
        label: t(SERVICE_TYPE_LABEL_KEYS[value]),
      })),
    [t],
  );

  const addressValue =
    locationKind === "dropoff" ? dropoffAddress : pickupAddress;
  const addressPlaceholder =
    detectingLocation && locationKind === "pickup"
      ? t("hero.carRentals.detectingLocation")
      : locationKind === "dropoff"
        ? t("hero.carRentals.dropoffAddress")
        : t("hero.carRentals.pickupAddress");

  const fillPickupFromCurrentLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      return;
    }
    if (locatingRef.current) {
      return;
    }

    locatingRef.current = true;
    setDetectingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        void reverseGeocode(position.coords.latitude, position.coords.longitude)
          .then((place) => {
            if (!place?.label) return;
            setPickupAddress(place.label);
            if (rentalMode === "daily-rental") {
              setDropoffAddress(place.label);
            }
          })
          .catch(() => undefined)
          .finally(() => {
            locatingRef.current = false;
            setDetectingLocation(false);
          });
      },
      () => {
        locatingRef.current = false;
        setDetectingLocation(false);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
    );
  }, [rentalMode]);

  useEffect(() => {
    if (didAutoFillOnMount.current) return;
    if (locationKind !== "pickup") return;
    if (searchParams.get("location")) return;
    didAutoFillOnMount.current = true;
    fillPickupFromCurrentLocation();
  }, [fillPickupFromCurrentLocation, locationKind, searchParams]);

  const handleAddressChange = (value: string) => {
    if (locationKind === "dropoff") {
      setDropoffAddress(value);
      if (rentalMode === "daily-rental") {
        setPickupAddress(value);
      }
      return;
    }

    setPickupAddress(value);
    if (rentalMode === "daily-rental") {
      setDropoffAddress(value);
    }
  };

  const handleRentalModeChange = (value: string) => {
    const next = pickParam(value, RENTAL_MODES, "pickup-dropoff");
    setRentalMode(next);

    if (next === "daily-rental") {
      setLocationKind("pickup");
      const shared = pickupAddress.trim() || dropoffAddress.trim();
      if (shared) {
        setPickupAddress(shared);
        setDropoffAddress(shared);
      } else {
        fillPickupFromCurrentLocation();
      }
    }
  };

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const pickup = pickupAddress.trim();
        const dropoff = dropoffAddress.trim();

        onSubmit({
          rentalMode,
          locationKind,
          location: pickup || dropoff,
          dropoffLocation:
            rentalMode === "pickup-dropoff" && dropoff && dropoff !== pickup
              ? dropoff
              : "",
          serviceType,
          date: pickupDate,
        });
      }}
    >
      <HeroInputShell>
        <HeroGlassSelect
          label={t("hero.carRentals.pickupAndDropoff")}
          value={rentalMode}
          options={rentalModeOptions}
          onChange={handleRentalModeChange}
          icon={<Car className="h-4 w-4 shrink-0" />}
        />
        <HeroGlassSelect
          label={t("hero.carRentals.pickupAndDropoff")}
          value={locationKind}
          options={locationKindOptions}
          onChange={(value) => {
            const next = pickParam(value, LOCATION_KINDS, "pickup");
            setLocationKind(next);
            if (next === "pickup") {
              fillPickupFromCurrentLocation();
            }
          }}
          icon={<MapPin className="h-4 w-4 shrink-0" />}
        />
        <HeroAddressField
          placeholder={addressPlaceholder}
          value={addressValue}
          onChange={handleAddressChange}
          listboxId="car-rental-address-listbox"
        />
      </HeroInputShell>

      <HeroInputShell>
        <div className="flex w-full min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:items-center">
          <HeroGlassSelect
            label={t("filters.serviceType.chauffeur")}
            value={serviceType}
            options={serviceTypeOptions}
            onChange={(value) =>
              setServiceType(pickParam(value, SERVICE_TYPES, "chauffeur"))
            }
            icon={
              <Image src="/wheel.png" alt="" width={20} height={20} aria-hidden />
            }
            className="flex-3"
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
            className="flex-2"
          />
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
