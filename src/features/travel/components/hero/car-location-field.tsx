"use client";

import { Car, MapPin, Plane } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";

import { useTranslation } from "@/hooks/use-translation";
import { listCarDestinations } from "@/lib/api/cars";
import { suggestFlightPlaces } from "@/lib/api/flights";
import { suggestAddresses } from "@/lib/api/places";

type SuggestionKind = "destination" | "airport" | "address";

type Suggestion = {
  id: string;
  kind: SuggestionKind;
  label: string;
  detail?: string;
  // What gets written into the field (and the search URL) on select.
  value: string;
};

type CarLocationFieldProps = {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  listboxId?: string;
};

const MAX_PER_GROUP = 5;

const KIND_ICON = {
  destination: Car,
  airport: Plane,
  address: MapPin,
} as const;

/**
 * Pickup / drop-off location for the car search. Suggests, in order:
 * places where cars are listed (so a pick always returns results), airports
 * (Duffel places — airport pickups are the common case) and any street
 * address (geocoder). Airports commit as "Name (IATA), City" so the results
 * filter matches cars listed in that city.
 */
export function CarLocationField({
  placeholder,
  value,
  onChange,
  listboxId = "car-location-listbox",
}: CarLocationFieldProps) {
  const t = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [debounced, setDebounced] = useState(value.trim());

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value.trim()), 250);
    return () => window.clearTimeout(id);
  }, [value]);

  const { data: destinations = [] } = useQuery({
    queryKey: ["car-destinations"],
    queryFn: listCarDestinations,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: places = [] } = useQuery({
    queryKey: ["car-airports", debounced],
    queryFn: ({ signal }) => suggestFlightPlaces(debounced, signal),
    enabled: open && debounced.length >= 2,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const { data: addresses = [] } = useQuery({
    queryKey: ["address-places", debounced],
    queryFn: ({ signal }) => suggestAddresses(debounced, signal),
    enabled: open && debounced.length >= 3,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const suggestions = useMemo<Suggestion[]>(() => {
    const query = value.trim().toLowerCase();
    const inventory = destinations
      .filter((d) => !query || d.location.toLowerCase().includes(query))
      .slice(0, MAX_PER_GROUP)
      .map<Suggestion>((d) => ({
        id: `destination-${d.location}`,
        kind: "destination",
        label: d.location,
        detail: t(
          d.count === 1
            ? "hero.carRentals.destinationCar"
            : "hero.carRentals.destinationCars",
          { count: d.count },
        ),
        value: d.location,
      }));

    // Airports only mean something once the user has typed.
    const airports = query
      ? places
          .filter((p) => p.type === "airport")
          .slice(0, MAX_PER_GROUP)
          .map<Suggestion>((p) => {
            const name = `${p.name} (${p.iataCode})`;
            return {
              id: `airport-${p.id}`,
              kind: "airport",
              label: name,
              detail: p.cityName ?? undefined,
              value: p.cityName ? `${name}, ${p.cityName}` : name,
            };
          })
      : [];

    const seen = new Set(
      [...inventory, ...airports].map((s) => s.value.toLowerCase()),
    );
    const streetAddresses = query
      ? addresses
          .filter((place) => !seen.has(place.label.toLowerCase()))
          .slice(0, MAX_PER_GROUP)
          .map<Suggestion>((place) => ({
            id: `address-${place.id}`,
            kind: "address",
            label: place.label,
            value: place.label,
          }))
      : [];

    return [...inventory, ...airports, ...streetAddresses];
  }, [addresses, destinations, places, t, value]);

  const showDropdown = open && suggestions.length > 0;

  useEffect(() => {
    if (!showDropdown) return;
    const measure = () => {
      const el = containerRef.current;
      if (el) setRect(el.getBoundingClientRect());
    };
    measure();
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [showDropdown]);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !containerRef.current?.contains(target) &&
        !dropdownRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const commit = (suggestion: Suggestion) => {
    onChange(suggestion.value);
    setOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!showDropdown) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      commit(suggestions[activeIndex]!);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  const groupHeading: Record<SuggestionKind, string> = {
    destination: t("hero.carRentals.suggestAvailable"),
    airport: t("hero.carRentals.suggestAirports"),
    address: t("hero.carRentals.suggestAddresses"),
  };

  const menu =
    showDropdown && rect && typeof document !== "undefined"
      ? createPortal(
          <ul
            ref={dropdownRef}
            id={listboxId}
            role="listbox"
            style={{
              position: "fixed",
              top: rect.bottom + 6,
              left: rect.left,
              width: Math.max(rect.width, 280),
              zIndex: 60,
            }}
            className="max-h-80 overflow-y-auto rounded-xl border border-black/10 bg-white py-1 shadow-lg"
          >
            {suggestions.map((suggestion, index) => {
              const Icon = KIND_ICON[suggestion.kind];
              const startsGroup =
                index === 0 || suggestions[index - 1]!.kind !== suggestion.kind;
              return (
                <li key={suggestion.id} role="presentation">
                  {startsGroup ? (
                    <p className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide font-satoshi text-[#9A9A9A]">
                      {groupHeading[suggestion.kind]}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    role="option"
                    aria-selected={index === activeIndex}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      commit(suggestion);
                    }}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm font-satoshi transition-colors ${
                      index === activeIndex ? "bg-[#F5F5F5]" : "bg-white"
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2 text-[#2F2F2F]">
                      <Icon className="h-4 w-4 shrink-0 text-[#676565]" />
                      <span className="truncate font-medium">
                        {suggestion.label}
                      </span>
                    </span>
                    {suggestion.detail ? (
                      <span className="shrink-0 text-xs font-medium text-[#676565]">
                        {suggestion.detail}
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>,
          document.body,
        )
      : null;

  return (
    <div ref={containerRef} className="relative min-w-0 flex-1">
      <label className="flex min-h-12 items-center gap-2 rounded-xl bg-[#0000003D] px-4 text-sm text-white/90">
        <MapPin className="h-4 w-4 shrink-0" />
        <input
          type="search"
          value={value}
          placeholder={placeholder}
          onChange={(event) => {
            onChange(event.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listboxId}
          aria-autocomplete="list"
          className="w-full min-w-0 bg-transparent text-sm text-white/90 outline-none placeholder:text-white/70"
        />
      </label>
      {menu}
    </div>
  );
}
