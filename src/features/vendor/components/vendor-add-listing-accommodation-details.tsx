"use client";

import { ChevronDown, ChevronUp, Clock, Info, MapPin } from "lucide-react";
import { useState } from "react";

import {
  ACCOMMODATION_PROPERTY_TYPES,
  getAccommodationPerkIcon,
  getAccommodationPerksForDisplay,
  getHiddenAccommodationPerkCount,
} from "@/features/vendor/data/accommodation-listing-perks";
import type { AddListingFormState } from "@/features/vendor/data/vendor-add-listing";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

const inputClassName =
  "h-11 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none focus:border-[#135391]";

const textareaClassName =
  "min-h-[120px] w-full resize-y rounded-lg border border-[#E5E5E5] bg-white px-3 py-2.5 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none focus:border-[#135391]";

const DESCRIPTION_MAX_LENGTH = 500;

const PROPERTY_TYPE_LABEL_KEYS: Record<
  (typeof ACCOMMODATION_PROPERTY_TYPES)[number],
  TranslationKey
> = {
  Hotels: "filters.propertyType.hotels",
  Apartments: "filters.propertyType.apartments",
  Resorts: "filters.propertyType.resorts",
  "B&Bs": "filters.propertyType.bbs",
  "Guest House": "filters.propertyType.guestHouse",
  "Beach House": "filters.propertyType.beachHouse",
  Motels: "filters.propertyType.motels",
};

type AccommodationDetailsFieldsProps = {
  form: AddListingFormState;
  onChange: (patch: Partial<AddListingFormState>) => void;
};

export function AccommodationDetailsFields({
  form,
  onChange,
}: AccommodationDetailsFieldsProps) {
  const t = useTranslation();
  const [perksExpanded, setPerksExpanded] = useState(false);

  const visiblePerks = getAccommodationPerksForDisplay(perksExpanded);
  const hiddenPerkCount = getHiddenAccommodationPerkCount(perksExpanded);

  const togglePerk = (perk: string) => {
    const isSelected = form.amenities.includes(perk);
    onChange({
      amenities: isSelected
        ? form.amenities.filter((item) => item !== perk)
        : [...form.amenities, perk],
    });
  };

  return (
    <section className="space-y-5">
      <h3 className="text-base font-bold font-satoshi text-[#2F2F2F]">
        {t("vendor.addListing.accommodationDetailsHeading")}
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={t("vendor.addListing.accommodationName")} required>
          <input
            type="text"
            value={form.propertyName}
            onChange={(event) => onChange({ propertyName: event.target.value })}
            placeholder={t("vendor.addListing.accommodationNamePlaceholder")}
            className={inputClassName}
          />
        </FormField>

        <FormField label={t("vendor.addListing.propertyType")} required>
          <select
            value={form.propertyType}
            onChange={(event) => onChange({ propertyType: event.target.value })}
            className={`${inputClassName} appearance-none bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10`}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23676565' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
            }}
          >
            <option value="">{t("vendor.addListing.propertyTypeSelect")}</option>
            {ACCOMMODATION_PROPERTY_TYPES.map((type) => (
              <option key={type} value={type}>
                {t(PROPERTY_TYPE_LABEL_KEYS[type])}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label={t("vendor.addListing.location")} required>
          <div className="relative">
            <input
              type="text"
              value={form.address}
              onChange={(event) => onChange({ address: event.target.value })}
              placeholder={t("vendor.addListing.accommodationLocationPlaceholder")}
              className={`${inputClassName} pr-10`}
            />
            <MapPin className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]" />
          </div>
        </FormField>

        <FormField label={t("vendor.addListing.accommodationMaxGuests")} required>
          <input
            type="number"
            min={1}
            value={form.accommodationMaxGuests}
            onChange={(event) => onChange({ accommodationMaxGuests: event.target.value })}
            placeholder={t("vendor.addListing.accommodationMaxGuestsPlaceholder")}
            className={inputClassName}
          />
        </FormField>

        <FormField label={t("vendor.addListing.checkInTime")} required>
          <div className="relative">
            <input
              type="time"
              value={form.checkInTime}
              onChange={(event) => onChange({ checkInTime: event.target.value })}
              className={`${inputClassName} pr-10`}
            />
            <Clock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]" />
          </div>
        </FormField>

        <FormField label={t("vendor.addListing.checkOutTime")} required>
          <div className="relative">
            <input
              type="time"
              value={form.checkOutTime}
              onChange={(event) => onChange({ checkOutTime: event.target.value })}
              className={`${inputClassName} pr-10`}
            />
            <Clock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]" />
          </div>
        </FormField>
      </div>

      <FormField label={t("vendor.addListing.availability")} required>
        <RadioGroup
          value={form.availabilityMode}
          options={[
            { value: "always", label: t("vendor.addListing.availabilityAlways") },
            { value: "date_range", label: t("vendor.addListing.availabilityDateRange") },
          ]}
          onChange={(value) =>
            onChange({ availabilityMode: value as AddListingFormState["availabilityMode"] })
          }
        />
        <p className="mt-3 flex items-start gap-2 text-xs font-medium font-satoshi text-[#676565]">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#135391]" />
          {t("vendor.addListing.availabilityHint")}
        </p>
      </FormField>

      <FormField label={t("vendor.addListing.shortDescription")} required>
        <div className="relative">
          <textarea
            value={form.accommodationDescription}
            maxLength={DESCRIPTION_MAX_LENGTH}
            onChange={(event) => onChange({ accommodationDescription: event.target.value })}
            placeholder={t("vendor.addListing.accommodationDescriptionPlaceholder")}
            className={textareaClassName}
          />
          <span className="pointer-events-none absolute bottom-3 right-3 text-xs font-medium font-satoshi text-[#676565]">
            {form.accommodationDescription.length} / {DESCRIPTION_MAX_LENGTH}
          </span>
        </div>
      </FormField>

      <div className="rounded-xl border border-[#EEEEEE] bg-white p-4 sm:p-5">
        <div>
          <h4 className="text-sm font-bold font-satoshi text-[#2F2F2F]">
            {t("vendor.addListing.popularPerks")}
          </h4>
          <p className="mt-1 text-xs font-medium font-satoshi text-[#676565]">
            {t("vendor.addListing.popularPerksHint")}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visiblePerks.map((perk) => {
            const Icon = getAccommodationPerkIcon(perk);
            const isSelected = form.amenities.includes(perk);

            return (
              <button
                key={perk}
                type="button"
                onClick={() => togglePerk(perk)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm font-medium font-satoshi transition-colors ${
                  isSelected
                    ? "border-[#D85A30] bg-[#FFF8F5] text-[#D85A30]"
                    : "border-[#E5E5E5] bg-white text-[#2F2F2F] hover:border-[#D0D0D0]"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                <span className="min-w-0 flex-1 leading-snug">{perk}</span>
              </button>
            );
          })}

          {!perksExpanded && hiddenPerkCount > 0 ? (
            <button
              type="button"
              onClick={() => setPerksExpanded(true)}
              className="flex items-center justify-between gap-2 rounded-lg border border-[#E5E5E5] bg-white px-3 py-2.5 text-sm font-medium font-satoshi text-[#2F2F2F] transition-colors hover:border-[#135391] hover:text-[#135391]"
            >
              {t("vendor.addListing.viewAllPerks")}
              <ChevronDown className="h-4 w-4 shrink-0" />
            </button>
          ) : null}

          {perksExpanded ? (
            <button
              type="button"
              onClick={() => setPerksExpanded(false)}
              className="flex items-center justify-between gap-2 rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] px-3 py-2.5 text-sm font-medium font-satoshi text-[#135391] transition-colors hover:border-[#135391]"
            >
              {t("vendor.addListing.showLessPerks")}
              <ChevronUp className="h-4 w-4 shrink-0" />
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
        {label}
        {required ? <span className="text-[#C0392B]"> *</span> : null}
      </span>
      {children}
    </label>
  );
}

function RadioGroup({
  value,
  options,
  onChange,
}: {
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-4">
      {options.map((option) => (
        <label
          key={option.value}
          className="inline-flex items-center gap-2 text-sm font-medium font-satoshi text-[#2F2F2F]"
        >
          <input
            type="radio"
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="h-4 w-4 border-[#CFCFCF] text-[#D85A30] focus:ring-[#D85A30]"
          />
          {option.label}
        </label>
      ))}
    </div>
  );
}
