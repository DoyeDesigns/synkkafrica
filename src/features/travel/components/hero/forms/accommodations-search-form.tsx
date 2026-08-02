"use client";

import { Building2, Calendar } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import {
  HeroField,
  HeroFormRow,
  HeroInputShell,
  HeroPillSelect,
  HeroSearchButton,
} from "@/features/travel/components/hero/hero-form-primitives";
import { HeroDestinationField } from "@/features/travel/components/hero/hero-destination-field";
import { listAccommodationDestinations } from "@/lib/api/accommodations";
import {
  getDefaultCheckInDate,
  getDefaultCheckOutDate,
} from "@/features/travel/booking/booking-params";
import {
  getPropertyTypeLabelById,
  getPropertyTypeIdByLabel,
  PROPERTY_TYPES,
} from "@/features/travel/data/accommodations-landing";
import { useFilterOptionLabel } from "@/hooks/use-filter-option-label";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

type AccommodationsSearchFormProps = {
  onSubmit: (fields: Record<string, string>) => void;
};

const ROOM_COUNTS = ["1", "2", "3", "4", "5"] as const;
const GUEST_COUNTS = ["1", "2", "3", "4", "5", "6", "7", "8"] as const;

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

function getInitialPropertyTypeId(searchParams: URLSearchParams) {
  const fromQuery = searchParams.get("propertyType");

  if (fromQuery) {
    const matchedId = getPropertyTypeIdByLabel(fromQuery);

    if (matchedId) {
      return matchedId;
    }
  }

  return PROPERTY_TYPES[0]?.id ?? "hotels";
}

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
  const searchParams = useSearchParams();
  const { labelPropertyTypeId } = useFilterOptionLabel();
  const [propertyTypeId, setPropertyTypeId] = useState(() =>
    getInitialPropertyTypeId(searchParams),
  );
  const [rooms, setRooms] = useState(
    () => searchParams.get("rooms") ?? "1",
  );
  const [guests, setGuests] = useState(
    () => searchParams.get("guests") ?? "1",
  );
  const [destination, setDestination] = useState(
    () => searchParams.get("destination") ?? "",
  );
  const [checkIn, setCheckIn] = useState(
    () => searchParams.get("checkIn") ?? getDefaultCheckInDate(),
  );
  const [checkOut, setCheckOut] = useState(
    () =>
      searchParams.get("checkOut") ??
      getDefaultCheckOutDate(searchParams.get("checkIn") ?? undefined),
  );

  const propertyTypeOptions = useMemo(
    () =>
      PROPERTY_TYPES.map((type) => ({
        value: type.id,
        label: labelPropertyTypeId(type.id, type.label),
      })),
    [labelPropertyTypeId],
  );

  const roomOptions = useMemo(
    () =>
      ROOM_COUNTS.map((count) => ({
        value: count,
        label: getCountLabel(
          count,
          "hero.accommodations.oneRoom",
          "hero.accommodations.roomsCount",
          t,
        ),
      })),
    [t],
  );

  const guestOptions = useMemo(
    () =>
      GUEST_COUNTS.map((count) => ({
        value: count,
        label: getCountLabel(
          count,
          "hero.accommodations.oneGuest",
          "hero.accommodations.guestsCount",
          t,
        ),
      })),
    [t],
  );

  const handleCheckInChange = (value: string) => {
    setCheckIn(value);

    if (!value) {
      return;
    }

    if (!checkOut || checkOut <= value) {
      setCheckOut(getDefaultCheckOutDate(value));
    }
  };

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          propertyType: getPropertyTypeLabelById(propertyTypeId),
          rooms,
          guests,
          destination: destination.trim(),
          checkIn,
          checkOut,
        });
      }}
    >
      <HeroFormRow>
        <HeroPillSelect
          label={t("hero.accommodations.propertyType")}
          icon={<Building2 className="h-4 w-4" />}
          options={propertyTypeOptions}
          value={propertyTypeId}
          onChange={setPropertyTypeId}
        />
        <div className="flex items-center gap-2">
          <HeroPillSelect
            label={t("hero.accommodations.oneRoom")}
            options={roomOptions}
            value={rooms}
            onChange={setRooms}
          />
          <HeroPillSelect
            label={t("hero.accommodations.oneGuest")}
            options={guestOptions}
            value={guests}
            onChange={setGuests}
          />
        </div>
      </HeroFormRow>

      <HeroInputShell>
        <HeroDestinationField
          placeholder={t("hero.accommodations.destination")}
          value={destination}
          onChange={setDestination}
          queryKey="accommodation-destinations"
          fetchDestinations={listAccommodationDestinations}
          countLabel={(count) =>
            t(
              count === 1
                ? "hero.accommodations.destinationStay"
                : "hero.accommodations.destinationStays",
              { count },
            )
          }
        />
        <HeroField
          icon={<Calendar className="h-4 w-4 shrink-0" />}
          placeholder={t("hero.accommodations.checkIn")}
          value={checkIn}
          onChange={handleCheckInChange}
          type="date"
          min={new Date().toISOString().split("T")[0]}
        />
        <HeroField
          icon={<Calendar className="h-4 w-4 shrink-0" />}
          placeholder={t("hero.accommodations.checkOut")}
          value={checkOut}
          onChange={setCheckOut}
          type="date"
          min={checkIn || new Date().toISOString().split("T")[0]}
        />
        <HeroSearchButton
          label={t("hero.accommodations.checkAvailability")}
          variant="coral"
        />
      </HeroInputShell>
    </form>
  );
}
