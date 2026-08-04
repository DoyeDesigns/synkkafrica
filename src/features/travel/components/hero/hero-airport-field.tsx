"use client";

import { Plane } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";

import { suggestFlightPlaces } from "@/lib/api/flights";

type HeroAirportFieldProps = {
  placeholder: string;
  // The committed value is an IATA code (what the flight search needs).
  value: string;
  onChange: (value: string) => void;
  listboxId: string;
  className?: string;
};

// Airport/city autocomplete for flight origin/destination. Backed by Duffel
// Places (server search per keystroke, debounced). Selecting a suggestion
// commits its IATA code; the input shows a friendly label. Portalled to escape
// the hero's `overflow-hidden`.
export function HeroAirportField({
  placeholder,
  value,
  onChange,
  listboxId,
  className = "",
}: HeroAirportFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const [text, setText] = useState(value);
  const [debounced, setDebounced] = useState(value.trim());
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [rect, setRect] = useState<DOMRect | null>(null);

  // Debounce the query sent to Duffel.
  useEffect(() => {
    const id = setTimeout(() => setDebounced(text.trim()), 200);
    return () => clearTimeout(id);
  }, [text]);

  const { data: suggestions = [] } = useQuery({
    queryKey: ["flight-places", debounced],
    queryFn: ({ signal }) => suggestFlightPlaces(debounced, signal),
    enabled: open && debounced.length >= 2,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

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

  const commit = (iataCode: string, label: string) => {
    setText(label);
    onChange(iataCode);
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
      const p = suggestions[activeIndex];
      commit(p.iataCode, `${p.iataCode} · ${p.name}`);
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
            {suggestions.map((p, index) => (
              <li key={p.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    commit(p.iataCode, `${p.iataCode} · ${p.name}`);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm font-satoshi transition-colors ${
                    index === activeIndex ? "bg-[#F5F5F5]" : "bg-white"
                  }`}
                >
                  <span className="flex min-w-0 flex-col text-[#2F2F2F]">
                    <span className="truncate font-medium">{p.name}</span>
                    {p.cityName ? (
                      <span className="truncate text-xs text-[#676565]">
                        {p.cityName}
                      </span>
                    ) : null}
                  </span>
                  <span className="shrink-0 rounded bg-[#F0F6FC] px-2 py-0.5 text-xs font-bold text-[#135391]">
                    {p.iataCode}
                  </span>
                </button>
              </li>
            ))}
          </ul>,
          document.body,
        )
      : null;

  return (
    <div ref={containerRef} className={`relative flex-1 ${className}`}>
      <label className="flex min-h-12 items-center gap-2 rounded-xl bg-[#0000003D] px-4 text-sm text-white/90">
        <Plane className="h-4 w-4 shrink-0" />
        <input
          type="search"
          value={text}
          placeholder={placeholder}
          onChange={(event) => {
            setText(event.target.value);
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
