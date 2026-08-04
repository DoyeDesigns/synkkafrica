"use client";

import { MapPin } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";

type Destination = { location: string; count: number };

type HeroDestinationFieldProps = {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  // React Query key + fetcher for the destination list (per category).
  queryKey: string;
  fetchDestinations: () => Promise<Destination[]>;
  // Rendered next to each suggestion's count, e.g. "5 stays".
  countLabel: (count: number) => string;
};

// Destination search input backed by the platform's live-listing locations.
// Only places with inventory are suggested, so every pick returns results. The
// dropdown is portalled to <body> because the hero section is `overflow-hidden`
// and would otherwise clip a menu that opens past its bottom edge.
export function HeroDestinationField({
  placeholder,
  value,
  onChange,
  queryKey,
  fetchDestinations,
  countLabel,
}: HeroDestinationFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const { data: destinations = [] } = useQuery({
    queryKey: [queryKey],
    queryFn: fetchDestinations,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const query = value.trim().toLowerCase();
  const suggestions = useMemo(() => {
    const matches = query
      ? destinations.filter((d) => d.location.toLowerCase().includes(query))
      : destinations;
    return matches.slice(0, 8);
  }, [destinations, query]);

  const showDropdown = open && suggestions.length > 0;

  // Keep the portalled menu aligned with the input while it's open.
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

  // Close on outside click (the menu lives in a portal, so check both nodes).
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
      commit(suggestions[activeIndex].location);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  const menu =
    showDropdown && rect && typeof document !== "undefined"
      ? createPortal(
          <ul
            ref={dropdownRef}
            id="hero-destination-listbox"
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
            {suggestions.map((d, index) => (
              <li key={d.location}>
                <button
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  // onMouseDown so selection fires before the input blur.
                  onMouseDown={(event) => {
                    event.preventDefault();
                    commit(d.location);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm font-satoshi transition-colors ${
                    index === activeIndex ? "bg-[#F5F5F5]" : "bg-white"
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2 text-[#2F2F2F]">
                    <MapPin className="h-4 w-4 shrink-0 text-[#676565]" />
                    <span className="truncate font-medium">{d.location}</span>
                  </span>
                  <span className="shrink-0 text-xs font-medium text-[#676565]">
                    {countLabel(d.count)}
                  </span>
                </button>
              </li>
            ))}
          </ul>,
          document.body,
        )
      : null;

  return (
    <div ref={containerRef} className="relative flex-1">
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
          aria-controls="hero-destination-listbox"
          aria-autocomplete="list"
          className="w-full min-w-0 bg-transparent text-sm text-white/90 outline-none placeholder:text-white/70"
        />
      </label>
      {menu}
    </div>
  );
}
