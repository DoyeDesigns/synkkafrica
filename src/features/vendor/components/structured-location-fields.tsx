"use client";

import { ChevronDown, MapPin } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";

import { useAddressAutocomplete } from "@/features/travel/hooks/use-address-autocomplete";
import { useTranslation } from "@/hooks/use-translation";
import { listCities, listCountries, listStates } from "@/lib/api/locations";
import { streetLineFromPlace } from "@/lib/api/places";
import {
  EMPTY_STRUCTURED_LOCATION,
  formatStructuredLocation,
  type StructuredLocationValue,
} from "@/lib/geo/structured-location";

const inputClassName =
  "h-11 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none focus:border-[#135391]";

type StructuredLocationFieldsProps = {
  value: StructuredLocationValue;
  onChange: (value: StructuredLocationValue) => void;
  streetOptional?: boolean;
};

export function StructuredLocationFields({
  value,
  onChange,
  streetOptional = true,
}: StructuredLocationFieldsProps) {
  const t = useTranslation();

  const { data: countries = [] } = useQuery({
    queryKey: ["geo-countries"],
    queryFn: ({ signal }) => listCountries(signal),
    staleTime: 24 * 60 * 60 * 1000,
  });

  const {
    data: states = [],
    isFetching: loadingStates,
    isFetched: statesFetched,
  } = useQuery({
    queryKey: ["geo-states", value.countryCode],
    queryFn: ({ signal }) => listStates(value.countryCode, signal),
    enabled: Boolean(value.countryCode),
    staleTime: 24 * 60 * 60 * 1000,
  });

  const needsState = states.length > 0;
  const cityReady =
    Boolean(value.countryCode) &&
    statesFetched &&
    (!needsState || Boolean(value.stateCode));

  const { data: cities = [], isFetching: loadingCities } = useQuery({
    queryKey: ["geo-cities", value.countryCode, value.stateCode],
    queryFn: ({ signal }) =>
      listCities(value.countryCode, value.stateCode || undefined, signal),
    enabled: cityReady,
    staleTime: 24 * 60 * 60 * 1000,
  });

  const handleCountry = (code: string) => {
    const country = countries.find((item) => item.code === code);
    onChange({
      ...EMPTY_STRUCTURED_LOCATION,
      street: value.street,
      countryCode: code,
      countryName: country?.name ?? "",
    });
  };

  const handleState = (code: string) => {
    const state = states.find((item) => item.code === code);
    onChange({
      ...value,
      stateCode: code,
      stateName: state?.name ?? "",
      cityName: "",
    });
  };

  const handleCity = (name: string) => {
    onChange({
      ...value,
      cityName: name,
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("vendor.location.country")} required>
          <SearchableSelect
            value={value.countryCode}
            displayValue={value.countryName}
            options={countries}
            placeholder={t("vendor.location.countryPlaceholder")}
            searchPlaceholder={t("vendor.location.searchCountry")}
            onChange={handleCountry}
          />
        </Field>

        <Field label={t("vendor.location.state")} required={needsState}>
          <SearchableSelect
            value={value.stateCode}
            displayValue={value.stateName}
            options={states}
            placeholder={
              !value.countryCode
                ? t("vendor.location.selectCountryFirst")
                : loadingStates
                  ? t("common.loading")
                  : needsState
                    ? t("vendor.location.statePlaceholder")
                    : t("vendor.location.noStates")
            }
            searchPlaceholder={t("vendor.location.searchState")}
            disabled={!value.countryCode || (!loadingStates && !needsState)}
            onChange={handleState}
          />
        </Field>

        <Field label={t("vendor.location.city")} required>
          <SearchableSelect
            value={value.cityName}
            displayValue={value.cityName}
            options={cities}
            placeholder={
              !cityReady
                ? t("vendor.location.selectStateFirst")
                : loadingCities
                  ? t("common.loading")
                  : t("vendor.location.cityPlaceholder")
            }
            searchPlaceholder={t("vendor.location.searchCity")}
            disabled={!cityReady}
            onChange={handleCity}
          />
        </Field>

        <Field
          label={t("vendor.location.street")}
          required={!streetOptional}
        >
          <StreetAddressField
            value={value.street}
            onChange={(street) => onChange({ ...value, street })}
            placeholder={t("vendor.location.streetPlaceholder")}
            city={value.cityName}
            state={value.stateName}
            country={value.countryName}
            countryCode={value.countryCode}
          />
        </Field>
      </div>

      {formatStructuredLocation(value) ? (
        <p className="text-xs font-medium font-satoshi text-[#676565]">
          {t("vendor.location.preview")}: {formatStructuredLocation(value)}
        </p>
      ) : null}
    </div>
  );
}

function StreetAddressField({
  value,
  onChange,
  placeholder,
  city,
  state,
  country,
  countryCode,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  city: string;
  state: string;
  country: string;
  countryCode: string;
}) {
  const scoped = Boolean(countryCode && city);
  const {
    containerRef,
    dropdownRef,
    text,
    suggestions,
    showDropdown,
    activeIndex,
    rect,
    setOpen,
    setActiveIndex,
    commit,
    handleChange,
    handleKeyDown,
  } = useAddressAutocomplete(value, onChange, {
    city,
    state,
    country,
    countryCode,
    enabled: scoped,
    formatCommit: (place) =>
      streetLineFromPlace(place, {
        cityName: city,
        stateName: state,
        countryName: country,
      }),
  });

  const menu =
    showDropdown && rect && typeof document !== "undefined"
      ? createPortal(
          <ul
            ref={dropdownRef}
            id="vendor-street-listbox"
            role="listbox"
            style={{
              position: "fixed",
              top: rect.bottom + 6,
              left: rect.left,
              width: rect.width,
              zIndex: 60,
            }}
            className="max-h-72 overflow-y-auto rounded-xl border border-black/10 bg-white py-1 shadow-lg"
          >
            {suggestions.map((place, index) => (
              <li key={place.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    commit(place);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-satoshi transition-colors ${
                    index === activeIndex ? "bg-[#F5F5F5]" : "bg-white"
                  }`}
                >
                  <MapPin className="h-4 w-4 shrink-0 text-[#676565]" />
                  <span className="truncate font-medium text-[#2F2F2F]">
                    {place.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>,
          document.body,
        )
      : null;

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]" />
        <input
          type="search"
          value={text}
          placeholder={placeholder}
          onChange={(event) => handleChange(event.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls="vendor-street-listbox"
          aria-autocomplete="list"
          className={`${inputClassName} pl-9`}
        />
      </div>
      {menu}
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
        {label}
        {required ? <span className="text-[#C0392B]"> *</span> : null}
      </span>
      {children}
    </div>
  );
}

function SearchableSelect({
  value,
  displayValue,
  options,
  placeholder,
  searchPlaceholder,
  disabled,
  onChange,
}: {
  value: string;
  displayValue: string;
  options: Array<{ code: string; name: string }>;
  placeholder: string;
  searchPlaceholder: string;
  disabled?: boolean;
  onChange: (code: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return options.slice(0, 80);
    return options
      .filter(
        (option) =>
          option.name.toLowerCase().includes(needle) ||
          option.code.toLowerCase().includes(needle),
      )
      .slice(0, 80);
  }, [options, query]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={`${inputClassName} flex items-center justify-between gap-2 text-left disabled:cursor-not-allowed disabled:bg-[#FAFAFA] disabled:opacity-70`}
      >
        <span className={displayValue ? "truncate text-[#2F2F2F]" : "truncate text-[#676565]"}>
          {displayValue || placeholder}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-[#676565]" />
      </button>

      {open && !disabled ? (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-[#E5E5E5] bg-white shadow-lg">
          <input
            autoFocus
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-10 w-full border-b border-[#EEEEEE] px-3 text-sm font-medium font-satoshi outline-none"
          />
          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm font-medium font-satoshi text-[#676565]">
                No matches
              </li>
            ) : (
              filtered.map((option) => (
                <li key={`${option.code}-${option.name}`}>
                  <button
                    type="button"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      onChange(option.code);
                      setOpen(false);
                    }}
                    className={`flex w-full px-3 py-2 text-left text-sm font-medium font-satoshi ${
                      option.code === value
                        ? "bg-[#F0F6FC] text-[#135391]"
                        : "text-[#2F2F2F] hover:bg-[#F8F8F8]"
                    }`}
                  >
                    {option.name}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
