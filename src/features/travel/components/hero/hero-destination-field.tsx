"use client";

import { MapPin } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";

import { suggestCities } from "@/lib/api/places";
import { rollupDestinationsByCity } from "@/lib/geo/city-supplements";

type Destination = { location: string; count: number };

type HeroDestinationFieldProps = {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  queryKey: string;
  fetchDestinations: () => Promise<Destination[]>;
  countLabel: (count: number) => string;
  listboxId?: string;
};

export function HeroDestinationField({
  placeholder,
  value,
  onChange,
  queryKey,
  fetchDestinations,
  countLabel,
  listboxId = "hero-destination-listbox",
}: HeroDestinationFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [lookup, setLookup] = useState("");

  const { data: destinations = [] } = useQuery({
    queryKey: [queryKey],
    queryFn: fetchDestinations,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const id = window.setTimeout(() => setLookup(value.trim()), 250);
    return () => window.clearTimeout(id);
  }, [value]);

  const { data: cityPlaces = [] } = useQuery({
    queryKey: ["hero-cities", lookup.toLowerCase()],
    queryFn: ({ signal }) => suggestCities(lookup, signal),
    enabled: open && lookup.length >= 2,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const query = value.trim().toLowerCase();
  const suggestions = useMemo(() => {
    const inventory = rollupDestinationsByCity(destinations);
    const matches = query
      ? inventory.filter((destination) =>
          destination.location.toLowerCase().includes(query),
        )
      : inventory;

    const merged = [...matches];
    for (const place of cityPlaces) {
      const city = place.city?.trim() || place.label.trim();
      if (!city) continue;
      const key = city.toLowerCase();
      if (merged.some((item) => item.location.toLowerCase() === key)) continue;
      if (query && !key.includes(query) && !query.includes(key)) continue;
      merged.push({ location: city, count: 0 });
    }

    return merged.slice(0, 8);
  }, [cityPlaces, destinations, query]);

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

  const commit = (location: string) => {
    onChange(location);
    setOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!showDropdown) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      const selected = suggestions[activeIndex];
      if (selected) commit(selected.location);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
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
              width: rect.width,
              zIndex: 60,
            }}
            className="max-h-72 overflow-y-auto rounded-xl border border-black/10 bg-white py-1 shadow-lg"
          >
            {suggestions.map((destination, index) => (
              <li key={destination.location}>
                <button
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    commit(destination.location);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm font-satoshi transition-colors ${
                    index === activeIndex ? "bg-[#F5F5F5]" : "bg-white"
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2 text-[#2F2F2F]">
                    <MapPin className="h-4 w-4 shrink-0 text-[#676565]" />
                    <span className="truncate font-medium">
                      {destination.location}
                    </span>
                  </span>
                  {destination.count > 0 ? (
                    <span className="shrink-0 text-xs font-medium text-[#676565]">
                      {countLabel(destination.count)}
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
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
